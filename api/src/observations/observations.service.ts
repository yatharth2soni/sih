import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { CreateObservationItemDto } from './dto/create-observation.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { InspectionStatus, Observation, UserRole } from '@prisma/client';

@Injectable()
export class ObservationsService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Record one or multiple observations under an in-progress inspection.
   */
  async createMany(
    inspectionId: string,
    items: CreateObservationItemDto[],
    user: RequestUser,
  ): Promise<Observation[]> {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Inspection "${inspectionId}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, inspection.mineId);

    if (inspection.status !== InspectionStatus.IN_PROGRESS) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Observations can only be recorded while inspection is IN_PROGRESS. Current status: ${inspection.status}`,
      });
    }

    if (!items || items.length === 0) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'At least one observation item must be provided',
      });
    }

    // Validate referenced compliance records and requirements
    for (const item of items) {
      if (item.complianceRecordId) {
        const record = await this.prisma.complianceRecord.findUnique({
          where: { id: item.complianceRecordId },
        });
        if (!record) {
          throw new NotFoundException({
            code: 'NOT_FOUND',
            message: `ComplianceRecord "${item.complianceRecordId}" not found`,
          });
        }
        if (record.mineId !== inspection.mineId) {
          throw new BadRequestException({
            code: 'VALIDATION_ERROR',
            message: `ComplianceRecord "${item.complianceRecordId}" belongs to mine "${record.mineId}", but inspection is for mine "${inspection.mineId}"`,
          });
        }
        if (
          item.complianceRequirementId &&
          record.requirementId !== item.complianceRequirementId
        ) {
          throw new BadRequestException({
            code: 'VALIDATION_ERROR',
            message: `ComplianceRecord "${item.complianceRecordId}" is for requirement "${record.requirementId}", not "${item.complianceRequirementId}"`,
          });
        }
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const lastObs = await tx.observation.findFirst({
        where: { inspectionId },
        orderBy: { sequenceNumber: 'desc' },
        select: { sequenceNumber: true },
      });

      let currentSeq = lastObs ? lastObs.sequenceNumber : 0;
      const created: Observation[] = [];

      for (const item of items) {
        currentSeq += 1;
        const obs = await tx.observation.create({
          data: {
            inspectionId,
            sequenceNumber: currentSeq,
            title: item.title,
            description: item.description,
            category: item.category,
            severity: item.severity || 'MEDIUM',
            findingType: item.findingType || 'NOTE',
            complianceRequirementId: item.complianceRequirementId,
            complianceRecordId: item.complianceRecordId,
            isViolationCandidate: item.isViolationCandidate || false,
            recordedById: user.id,
          },
          include: {
            complianceRequirement: { select: { id: true, title: true } },
            complianceRecord: { select: { id: true, status: true } },
            recordedBy: { select: { id: true, name: true, email: true } },
          },
        });
        created.push(obs);
      }

      return created;
    });
  }

  /**
   * Update an observation finding. Permitted while IN_PROGRESS, or by ADMIN/REGULATOR.
   */
  async update(
    id: string,
    dto: UpdateObservationDto,
    user: RequestUser,
  ): Promise<Observation> {
    const observation = await this.prisma.observation.findUnique({
      where: { id },
      include: { inspection: true },
    });

    if (!observation) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Observation "${id}" not found`,
      });
    }

    await this.scopeService.assertMineAccess(user, observation.inspection.mineId);

    const isPrivileged =
      user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR;

    if (
      observation.inspection.status !== InspectionStatus.IN_PROGRESS &&
      !isPrivileged
    ) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: `Observations cannot be modified after inspection is ${observation.inspection.status}`,
      });
    }

    return this.prisma.observation.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        severity: dto.severity,
        findingType: dto.findingType,
        complianceRequirementId: dto.complianceRequirementId,
        complianceRecordId: dto.complianceRecordId,
        isViolationCandidate: dto.isViolationCandidate,
      },
      include: {
        complianceRequirement: { select: { id: true, title: true } },
        complianceRecord: { select: { id: true, status: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
