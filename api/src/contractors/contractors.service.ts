import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';
import { QueryContractorsDto } from './dto/query-contractors.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { TerminateContractDto } from './dto/terminate-contract.dto';
import { QueryContractsDto } from './dto/query-contracts.dto';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AssignWorkerDto, UnassignWorkerDto } from './dto/assign-worker.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import {
  ContractorStatus,
  ContractStatus,
  WorkerStatus,
  UserRole,
  Prisma,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class ContractorsService {
  private readonly logger = new Logger(ContractorsService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Helper: Resolve effective companyId for write operations.
   */
  private async resolveEffectiveCompanyId(
    user: RequestUser,
    explicitCompanyId?: string,
  ): Promise<string> {
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      if (!explicitCompanyId) {
        throw new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'companyId is required for administrators/regulators',
        });
      }
      return explicitCompanyId;
    }

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (!dbUser?.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'User is not associated with any company',
        });
      }
      if (explicitCompanyId && explicitCompanyId !== dbUser.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot manage contractors for another company',
        });
      }
      return dbUser.companyId;
    }

    throw new ForbiddenException({
      code: 'FORBIDDEN',
      message: 'Only corporate managers and administrators can manage contractors',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. CONTRACTOR ENTITY LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  async createContractor(dto: CreateContractorDto, user: RequestUser) {
    const companyId = await this.resolveEffectiveCompanyId(user, dto.companyId);

    // Uniqueness check for registrationNumber within the company
    if (dto.registrationNumber) {
      const existing = await this.prisma.contractor.findUnique({
        where: {
          companyId_registrationNumber: {
            companyId,
            registrationNumber: dto.registrationNumber,
          },
        },
      });
      if (existing) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: `Contractor with registration number "${dto.registrationNumber}" already exists in this company`,
        });
      }
    }

    return this.prisma.contractor.create({
      data: {
        companyId,
        legalName: dto.legalName,
        tradeName: dto.tradeName,
        registrationNumber: dto.registrationNumber,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        status: ContractorStatus.ACTIVE,
      },
      include: {
        company: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getContractors(
    query: QueryContractorsDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ContractorWhereInput = {
      deletedAt: null,
    };

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      if (!accessibleMineIds || accessibleMineIds.length === 0) {
        return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
      }
      where.contracts = {
        some: {
          mineId: { in: accessibleMineIds },
          status: ContractStatus.ACTIVE,
        },
      };
    } else if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { legalName: { contains: query.search, mode: 'insensitive' } },
        { tradeName: { contains: query.search, mode: 'insensitive' } },
        { registrationNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [contractors, total] = await Promise.all([
      this.prisma.contractor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { legalName: 'asc' },
        include: {
          company: { select: { id: true, name: true, code: true } },
          _count: { select: { contracts: true, workers: true } },
        },
      }),
      this.prisma.contractor.count({ where }),
    ]);

    return {
      data: contractors,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getContractor(id: string, user: RequestUser) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, code: true } },
        contracts: {
          orderBy: { startDate: 'desc' },
          include: { mine: { select: { id: true, name: true, code: true } } },
        },
        _count: { select: { workers: true, contracts: true } },
      },
    });

    if (!contractor || contractor.deletedAt) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contractor "${id}" not found`,
      });
    }

    // Scoping checks
    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (contractor.companyId !== dbUser?.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot access contractors from another company',
        });
      }
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      const hasActiveContract = contractor.contracts.some(
        (c) =>
          c.status === ContractStatus.ACTIVE &&
          c.mineId &&
          accessibleMineIds?.includes(c.mineId),
      );
      if (!hasActiveContract) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this contractor',
        });
      }
    }

    return contractor;
  }

  async updateContractor(
    id: string,
    dto: UpdateContractorDto,
    user: RequestUser,
  ) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id },
    });

    if (!contractor || contractor.deletedAt) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contractor "${id}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contractor.companyId);

    if (
      dto.registrationNumber &&
      dto.registrationNumber !== contractor.registrationNumber
    ) {
      const existing = await this.prisma.contractor.findUnique({
        where: {
          companyId_registrationNumber: {
            companyId: contractor.companyId,
            registrationNumber: dto.registrationNumber,
          },
        },
      });
      if (existing) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: `Registration number "${dto.registrationNumber}" already exists in this company`,
        });
      }
    }

    return this.prisma.contractor.update({
      where: { id },
      data: {
        legalName: dto.legalName,
        tradeName: dto.tradeName,
        registrationNumber: dto.registrationNumber,
        contactName: dto.contactName,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        status: dto.status,
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CONTRACTOR CONTRACTS LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  async createContract(
    contractorId: string,
    dto: CreateContractDto,
    user: RequestUser,
  ) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
    });

    if (!contractor || contractor.deletedAt) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contractor "${contractorId}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contractor.companyId);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // 1. Date range validation
    if (endDate.getTime() < startDate.getTime()) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Contract endDate cannot be earlier than startDate',
      });
    }

    // 2. Mine company alignment check
    if (dto.mineId) {
      const mine = await this.prisma.mine.findUnique({
        where: { id: dto.mineId },
      });
      if (!mine) {
        throw new NotFoundException({
          code: 'NOT_FOUND',
          message: `Mine "${dto.mineId}" not found`,
        });
      }
      if (mine.companyId !== contractor.companyId) {
        throw new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: `Mine "${mine.code}" does not belong to contractor's company`,
        });
      }
    }

    // 3. Duplicate contract number check within company
    const existingContract = await this.prisma.contractorContract.findUnique({
      where: {
        companyId_contractNumber: {
          companyId: contractor.companyId,
          contractNumber: dto.contractNumber,
        },
      },
    });

    if (existingContract) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Contract number "${dto.contractNumber}" already exists within this company`,
      });
    }

    return this.prisma.contractorContract.create({
      data: {
        contractorId,
        companyId: contractor.companyId,
        mineId: dto.mineId,
        contractNumber: dto.contractNumber,
        title: dto.title,
        startDate,
        endDate,
        status: ContractStatus.ACTIVE,
        scopeOfWork: dto.scopeOfWork,
        createdById: user.id,
      },
      include: {
        contractor: { select: { id: true, legalName: true, tradeName: true } },
        mine: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getContracts(
    query: QueryContractsDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ContractorContractWhereInput = {};

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);
      if (!accessibleMineIds || accessibleMineIds.length === 0) {
        return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
      }
      where.mineId = { in: accessibleMineIds };
    } else if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.contractorId) where.contractorId = query.contractorId;
    if (query.mineId) where.mineId = query.mineId;
    if (query.status) where.status = query.status;

    const asOfDate = query.asOf ? new Date(query.asOf) : new Date();

    const [contracts, total] = await Promise.all([
      this.prisma.contractorContract.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { startDate: 'desc' },
        include: {
          contractor: { select: { id: true, legalName: true, tradeName: true, registrationNumber: true } },
          mine: { select: { id: true, name: true, code: true } },
          _count: { select: { workerAssignments: true } },
        },
      }),
      this.prisma.contractorContract.count({ where }),
    ]);

    // Format and dynamically compute status if expired relative to asOfDate
    const computedData = contracts.map((c) => {
      let effectiveStatus = c.status;
      if (c.status === ContractStatus.ACTIVE && c.endDate < asOfDate) {
        effectiveStatus = ContractStatus.EXPIRED;
      }
      return {
        ...c,
        effectiveStatus,
      };
    });

    return {
      data: computedData,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getContract(id: string, user: RequestUser) {
    const contract = await this.prisma.contractorContract.findUnique({
      where: { id },
      include: {
        contractor: true,
        company: { select: { id: true, name: true, code: true } },
        mine: { select: { id: true, name: true, code: true } },
        workerAssignments: {
          where: { status: WorkerStatus.ACTIVE },
          include: { worker: true },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contract "${id}" not found`,
      });
    }

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (contract.companyId !== dbUser?.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot view contracts belonging to another company',
        });
      }
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      if (contract.mineId) {
        await this.scopeService.assertMineAccess(user, contract.mineId);
      }
    }

    let effectiveStatus = contract.status;
    if (contract.status === ContractStatus.ACTIVE && contract.endDate < new Date()) {
      effectiveStatus = ContractStatus.EXPIRED;
    }

    return { ...contract, effectiveStatus };
  }

  async updateContract(id: string, dto: UpdateContractDto, user: RequestUser) {
    const contract = await this.prisma.contractorContract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contract "${id}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contract.companyId);

    const startDate = dto.startDate ? new Date(dto.startDate) : contract.startDate;
    const endDate = dto.endDate ? new Date(dto.endDate) : contract.endDate;

    if (endDate.getTime() < startDate.getTime()) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Contract endDate cannot be earlier than startDate',
      });
    }

    if (dto.mineId && dto.mineId !== contract.mineId) {
      const mine = await this.prisma.mine.findUnique({ where: { id: dto.mineId } });
      if (!mine || mine.companyId !== contract.companyId) {
        throw new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'Specified mine does not belong to the contract company',
        });
      }
    }

    return this.prisma.contractorContract.update({
      where: { id },
      data: {
        title: dto.title,
        startDate,
        endDate,
        mineId: dto.mineId,
        scopeOfWork: dto.scopeOfWork,
      },
    });
  }

  async terminateContract(
    id: string,
    dto: TerminateContractDto,
    user: RequestUser,
  ) {
    const contract = await this.prisma.contractorContract.findUnique({
      where: { id },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contract "${id}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contract.companyId);

    if (
      contract.status === ContractStatus.TERMINATED ||
      contract.status === ContractStatus.EXPIRED
    ) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Contract is already in "${contract.status}" status and cannot be terminated`,
      });
    }

    return this.prisma.contractorContract.update({
      where: { id },
      data: {
        status: ContractStatus.TERMINATED,
        terminationReason: dto.reason,
        terminatedAt: new Date(),
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. MINE ACTIVE CONTRACTOR ROSTER
  // ═══════════════════════════════════════════════════════════════════════════

  async getMineActiveContractors(
    mineId: string,
    asOfStr?: string,
    user?: RequestUser,
  ) {
    if (user) {
      await this.scopeService.assertMineAccess(user, mineId);
    }

    const mine = await this.prisma.mine.findUnique({
      where: { id: mineId },
      include: { company: true },
    });

    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine "${mineId}" not found`,
      });
    }

    const asOf = asOfStr ? new Date(asOfStr) : new Date();

    const activeContracts = await this.prisma.contractorContract.findMany({
      where: {
        OR: [{ mineId }, { mineId: null, companyId: mine.companyId }],
        status: ContractStatus.ACTIVE,
        startDate: { lte: asOf },
        endDate: { gte: asOf },
      },
      include: {
        contractor: true,
        workerAssignments: {
          where: { status: WorkerStatus.ACTIVE, mineId },
          include: { worker: true },
        },
      },
    });

    const roster = activeContracts.map((c) => ({
      contractId: c.id,
      contractNumber: c.contractNumber,
      contractTitle: c.title,
      startDate: c.startDate,
      endDate: c.endDate,
      contractor: {
        id: c.contractor.id,
        legalName: c.contractor.legalName,
        tradeName: c.contractor.tradeName,
        registrationNumber: c.contractor.registrationNumber,
        contactName: c.contractor.contactName,
        phone: c.contractor.phone,
        email: c.contractor.email,
        status: c.contractor.status,
      },
      activeWorkersCount: c.workerAssignments.length,
      workers: c.workerAssignments.map((wa) => ({
        workerId: wa.worker.id,
        employeeCode: wa.worker.employeeCode,
        fullName: wa.worker.fullName,
        role: wa.worker.role,
        governmentIdMasked: wa.worker.governmentIdMasked,
        assignedAt: wa.assignedAt,
      })),
    }));

    return {
      mine: { id: mine.id, name: mine.name, code: mine.code },
      asOf,
      totalActiveContractors: roster.length,
      roster,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CONTRACTOR WORKERS & SITE ASSIGNMENTS
  // ═══════════════════════════════════════════════════════════════════════════

  async createWorker(
    contractorId: string,
    dto: CreateWorkerDto,
    user: RequestUser,
  ) {
    const contractor = await this.prisma.contractor.findUnique({
      where: { id: contractorId },
    });

    if (!contractor || contractor.deletedAt) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contractor "${contractorId}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contractor.companyId);

    if (dto.employeeCode) {
      const existing = await this.prisma.contractorWorker.findUnique({
        where: {
          contractorId_employeeCode: {
            contractorId,
            employeeCode: dto.employeeCode,
          },
        },
      });
      if (existing) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: `Worker with employee code "${dto.employeeCode}" already exists for this contractor`,
        });
      }
    }

    let governmentIdHash: string | undefined;
    let governmentIdMasked: string | undefined;

    if (dto.governmentId) {
      governmentIdHash = crypto
        .createHash('sha256')
        .update(dto.governmentId.trim())
        .digest('hex');
      const clean = dto.governmentId.replace(/[\s-]/g, '');
      governmentIdMasked = `XXXX-XXXX-${clean.slice(-4)}`;
    }

    const worker = await this.prisma.contractorWorker.create({
      data: {
        contractorId,
        employeeCode: dto.employeeCode,
        fullName: dto.fullName,
        phone: dto.phone,
        governmentIdHash,
        governmentIdMasked,
        role: dto.role,
        status: WorkerStatus.ACTIVE,
      },
    });

    // Sync unified Worker profile
    await this.prisma.worker.create({
      data: {
        companyId: contractor.companyId,
        employmentType: 'CONTRACTOR',
        displayName: worker.fullName,
        employeeCode: worker.employeeCode,
        phone: worker.phone,
        contractorWorkerId: worker.id,
        status: WorkerStatus.ACTIVE,
      },
    });

    return worker;
  }

  async getWorkers(contractorId: string, user: RequestUser) {
    const contractor = await this.getContractor(contractorId, user);
    return this.prisma.contractorWorker.findMany({
      where: { contractorId: contractor.id },
      orderBy: { fullName: 'asc' },
    });
  }

  async updateWorker(
    workerId: string,
    dto: UpdateWorkerDto,
    user: RequestUser,
  ) {
    const worker = await this.prisma.contractorWorker.findUnique({
      where: { id: workerId },
      include: { contractor: true },
    });

    if (!worker) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Worker "${workerId}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, worker.contractor.companyId);

    return this.prisma.contractorWorker.update({
      where: { id: workerId },
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        role: dto.role,
        status: dto.status,
      },
    });
  }

  async assignWorkerToContract(
    contractId: string,
    dto: AssignWorkerDto,
    user: RequestUser,
  ) {
    const contract = await this.prisma.contractorContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contract "${contractId}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contract.companyId);

    const worker = await this.prisma.contractorWorker.findUnique({
      where: { id: dto.workerId },
    });

    if (!worker || worker.contractorId !== contract.contractorId) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Worker does not belong to the contract contractor',
      });
    }

    const targetMineId = dto.mineId || contract.mineId;
    if (!targetMineId) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'mineId must be specified when assigning worker to a company-wide contract',
      });
    }

    return this.prisma.contractorWorkerAssignment.upsert({
      where: {
        workerId_contractId_mineId: {
          workerId: dto.workerId,
          contractId,
          mineId: targetMineId,
        },
      },
      update: {
        status: WorkerStatus.ACTIVE,
        unassignedAt: null,
      },
      create: {
        workerId: dto.workerId,
        contractId,
        mineId: targetMineId,
        status: WorkerStatus.ACTIVE,
      },
    });
  }

  async unassignWorkerFromContract(
    contractId: string,
    dto: UnassignWorkerDto,
    user: RequestUser,
  ) {
    const contract = await this.prisma.contractorContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Contract "${contractId}" not found`,
      });
    }

    await this.resolveEffectiveCompanyId(user, contract.companyId);

    const assignment = await this.prisma.contractorWorkerAssignment.findFirst({
      where: {
        contractId,
        workerId: dto.workerId,
        status: WorkerStatus.ACTIVE,
      },
    });

    if (!assignment) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Active worker assignment not found for this contract',
      });
    }

    return this.prisma.contractorWorkerAssignment.update({
      where: { id: assignment.id },
      data: {
        status: WorkerStatus.INACTIVE,
        unassignedAt: new Date(),
      },
    });
  }
}
