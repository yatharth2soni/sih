import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import {
  canonicalizePayload,
  computePayloadHash,
  computeHmacChainHash,
  GENESIS_PREV_HASH,
  CHAIN_VERSION,
} from './canonicalizer';
import { QueryAuditLogsDto } from './dto/query-audit-logs.dto';
import { VerifyAuditChainDto } from './dto/verify-audit-chain.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import { UserRole, Prisma } from '@prisma/client';

export interface AuditAppendInput {
  action: string;
  entityType: string;
  entityId: string;
  actorId?: string | null;
  companyId?: string | null;
  mineId?: string | null;
  beforeSummary?: Record<string, any> | null;
  afterSummary?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  correlationId?: string | null;
  occurredAt?: Date;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly hmacSecret: string;

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
    private configService: ConfigService,
  ) {
    this.hmacSecret =
      this.configService.get<string>('AUDIT_HMAC_SECRET') ||
      'khanan-suraksha-audit-hmac-secret-key-2026';
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. APPEND-ONLY CRYPTOGRAPHIC LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Appends an immutable, hash-chained audit record to the log.
   */
  async appendEntry(input: AuditAppendInput, txPrisma?: Prisma.TransactionClient) {
    const db = txPrisma || this.prisma;
    const occurredAt = input.occurredAt || new Date();

    // Fetch previous head record to determine next sequence and prevHash
    const lastRecord = await db.auditLog.findFirst({
      orderBy: { sequence: 'desc' },
      select: { sequence: true, hmacHash: true },
    });

    const nextSequence = lastRecord ? lastRecord.sequence + 1 : 1;
    const prevHash = lastRecord ? lastRecord.hmacHash : GENESIS_PREV_HASH;

    // Construct canonical event payload
    const eventPayload = {
      sequence: nextSequence,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      actorId: input.actorId || null,
      companyId: input.companyId || null,
      mineId: input.mineId || null,
      beforeSummary: input.beforeSummary || null,
      afterSummary: input.afterSummary || null,
      metadata: input.metadata || null,
      occurredAt: occurredAt.toISOString(),
      chainVersion: CHAIN_VERSION,
    };

    const canonicalString = canonicalizePayload(eventPayload);
    const payloadHash = computePayloadHash(canonicalString);
    const hmacHash = computeHmacChainHash(
      this.hmacSecret,
      prevHash,
      payloadHash,
      nextSequence,
    );

    const logEntry = await db.auditLog.create({
      data: {
        sequence: nextSequence,
        occurredAt,
        actorId: input.actorId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        companyId: input.companyId || null,
        mineId: input.mineId || null,
        beforeSummary: input.beforeSummary ? (input.beforeSummary as any) : Prisma.JsonNull,
        afterSummary: input.afterSummary ? (input.afterSummary as any) : Prisma.JsonNull,
        metadata: input.metadata ? (input.metadata as any) : Prisma.JsonNull,
        prevHash,
        payloadHash,
        hmacHash,
        chainVersion: CHAIN_VERSION,
        correlationId: input.correlationId || null,
      },
    });

    this.logger.log(
      `[AuditLog #${logEntry.sequence}] Appended: ${input.action} on ${input.entityType} (${input.entityId}) [HMAC: ${hmacHash.slice(0, 12)}...]`,
    );

    return logEntry;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CHAIN VERIFICATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifies the cryptographic hash-chain integrity across a range of audit log entries.
   */
  async verifyChain(dto: VerifyAuditChainDto, user: RequestUser) {
    // Only Admin, Regulator, and Corporate users may run chain verifications
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.REGULATOR &&
      user.role !== UserRole.CORPORATE
    ) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only authorized auditors/regulators can verify audit trail integrity',
      });
    }

    const fromSequence = dto.fromSequence || 1;
    const where: Prisma.AuditLogWhereInput = {
      sequence: { gte: fromSequence },
    };
    if (dto.toSequence) {
      where.sequence = { gte: fromSequence, lte: dto.toSequence };
    }

    const records = await this.prisma.auditLog.findMany({
      where,
      orderBy: { sequence: 'asc' },
    });

    if (records.length === 0) {
      return {
        valid: true,
        verifiedCount: 0,
        message: 'No audit records found in specified range',
        chainVersion: CHAIN_VERSION,
      };
    }

    let expectedPrevHash = records[0].sequence === 1 ? GENESIS_PREV_HASH : records[0].prevHash;

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      // 1. Verify sequence order continuity
      if (i > 0 && record.sequence !== records[i - 1].sequence + 1) {
        return {
          valid: false,
          firstMismatchSequence: record.sequence,
          reason: `Missing sequence gap detected: expected #${records[i - 1].sequence + 1} but found #${record.sequence}`,
          chainVersion: CHAIN_VERSION,
        };
      }

      // 2. Verify prevHash link continuity
      if (record.prevHash !== expectedPrevHash) {
        return {
          valid: false,
          firstMismatchSequence: record.sequence,
          reason: `Chain link broken at #${record.sequence}: prevHash does not match predecessor hmacHash`,
          expectedPrevHash,
          actualPrevHash: record.prevHash,
          chainVersion: CHAIN_VERSION,
        };
      }

      // 3. Re-canonicalize payload and verify payloadHash
      const reCanonicalPayload = {
        sequence: record.sequence,
        action: record.action,
        entityType: record.entityType,
        entityId: record.entityId,
        actorId: record.actorId || null,
        companyId: record.companyId || null,
        mineId: record.mineId || null,
        beforeSummary: record.beforeSummary || null,
        afterSummary: record.afterSummary || null,
        metadata: record.metadata || null,
        occurredAt: record.occurredAt.toISOString(),
        chainVersion: record.chainVersion,
      };

      const canonicalString = canonicalizePayload(reCanonicalPayload);
      const computedPayloadHash = computePayloadHash(canonicalString);

      if (computedPayloadHash !== record.payloadHash) {
        return {
          valid: false,
          firstMismatchSequence: record.sequence,
          reason: `Payload tampering detected at #${record.sequence}: stored payloadHash does not match computed canonical hash`,
          chainVersion: CHAIN_VERSION,
        };
      }

      // 4. Recompute HMAC signature using server secret
      const computedHmac = computeHmacChainHash(
        this.hmacSecret,
        record.prevHash,
        record.payloadHash,
        record.sequence,
      );

      if (computedHmac !== record.hmacHash) {
        return {
          valid: false,
          firstMismatchSequence: record.sequence,
          reason: `HMAC signature verification failed at #${record.sequence}: record was modified or recalculated without server secret`,
          chainVersion: CHAIN_VERSION,
        };
      }

      // Update expected hash for next record
      expectedPrevHash = record.hmacHash;
    }

    const last = records[records.length - 1];
    return {
      valid: true,
      verifiedCount: records.length,
      fromSequence: records[0].sequence,
      toSequence: last.sequence,
      headSequence: last.sequence,
      headHmacHash: last.hmacHash,
      chainVersion: CHAIN_VERSION,
      securityDisclosure:
        'Dual-layer cryptographic audit chain (SHA-256 canonical payload hash + HMAC-SHA-256 chain links). Verifies that records have not been altered, injected, or deleted in the database.',
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SCOPE-FILTERED AUDIT QUERY
  // ═══════════════════════════════════════════════════════════════════════════

  async getLogs(query: QueryAuditLogsDto, user: RequestUser): Promise<PaginatedResponse<any>> {
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.REGULATOR &&
      user.role !== UserRole.CORPORATE &&
      user.role !== UserRole.MINE_OFFICIAL
    ) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only authorized personnel may view governance audit trails',
      });
    }

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AuditLogWhereInput = {};

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      where.mineId = { in: accessibleMineIds || [] };
    }

    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.action) where.action = query.action;
    if (query.actorId) where.actorId = query.actorId;
    if (query.mineId) {
      if (user.role === UserRole.MINE_OFFICIAL) {
        await this.scopeService.assertMineAccess(user, query.mineId);
      }
      where.mineId = query.mineId;
    }
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      if (query.companyId) where.companyId = query.companyId;
    }

    if (query.cursor) {
      where.sequence = { gte: query.cursor };
    }

    if (query.from || query.to) {
      where.occurredAt = {};
      if (query.from) where.occurredAt.gte = new Date(query.from);
      if (query.to) where.occurredAt.lte = new Date(query.to);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { sequence: 'desc' },
        include: {
          actor: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getEntityHistory(entityType: string, entityId: string, user: RequestUser) {
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.REGULATOR &&
      user.role !== UserRole.CORPORATE &&
      user.role !== UserRole.MINE_OFFICIAL
    ) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only authorized personnel may view governance audit trails',
      });
    }

    const logs = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { sequence: 'asc' },
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return {
      entityType,
      entityId,
      totalEntries: logs.length,
      data: logs,
    };
  }
}
