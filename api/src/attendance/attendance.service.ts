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
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { QueryAttendanceDto, AttendanceQueryStatus } from './dto/query-attendance.dto';
import { AttendanceSummaryDto } from './dto/attendance-summary.dto';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { QueryWorkersDto } from './dto/query-workers.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import {
  EmploymentType,
  AttendanceMethod,
  WorkerStatus,
  ContractStatus,
  UserRole,
  Prisma,
} from '@prisma/client';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Computes the business date formatted as "YYYY-MM-DD" in Indian Standard Time (IST, UTC+5:30).
   */
  getBusinessDate(date: Date): string {
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toISOString().split('T')[0];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. SHIFT CHECK-IN & CHECK-OUT LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  async checkIn(dto: CheckInDto, user: RequestUser) {
    // 1. Fetch target Worker
    const worker = await this.prisma.worker.findUnique({
      where: { id: dto.workerId },
      include: {
        company: true,
        contractorWorker: {
          include: {
            contractor: true,
            assignments: {
              include: { contract: true },
            },
          },
        },
      },
    });

    if (!worker) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Worker "${dto.workerId}" not found`,
      });
    }

    if (worker.status === WorkerStatus.INACTIVE) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Inactive workers cannot be checked into a mine',
      });
    }

    // 2. Fetch target Mine
    const mine = await this.prisma.mine.findUnique({
      where: { id: dto.mineId },
      include: { company: true },
    });

    if (!mine) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Mine "${dto.mineId}" not found`,
      });
    }

    if (mine.companyId !== worker.companyId) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: `Worker belongs to company "${worker.company.code}", but mine belongs to "${mine.company.code}"`,
      });
    }

    // 3. Authorization Check
    if (user.role === UserRole.MINE_OFFICIAL) {
      await this.scopeService.assertMineAccess(user, mine.id);
    } else if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (dbUser?.companyId !== mine.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot manage attendance for another company',
        });
      }
    }

    const checkInAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    // 4. Contract & Site Eligibility Validation (for Contractor Workers)
    if (worker.employmentType === EmploymentType.CONTRACTOR && worker.contractorWorker) {
      const cw = worker.contractorWorker;
      if (cw.status === WorkerStatus.INACTIVE || cw.contractor.status !== 'ACTIVE') {
        throw new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'Contractor is suspended or inactive; worker cannot check in',
        });
      }

      // Verify active contract or assignment at target mine
      const hasActiveAssignment = cw.assignments.some(
        (a) =>
          a.mineId === mine.id &&
          a.status === WorkerStatus.ACTIVE &&
          a.contract.status === ContractStatus.ACTIVE &&
          a.contract.startDate <= checkInAt &&
          a.contract.endDate >= checkInAt,
      );

      // Check if contractor has an active company-wide contract
      const hasCompanyWideContract = await this.prisma.contractorContract.findFirst({
        where: {
          contractorId: cw.contractorId,
          companyId: mine.companyId,
          mineId: null,
          status: ContractStatus.ACTIVE,
          startDate: { lte: checkInAt },
          endDate: { gte: checkInAt },
        },
      });

      if (!hasActiveAssignment && !hasCompanyWideContract) {
        throw new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'Contractor worker does not have an active valid contract or site assignment at this mine',
        });
      }
    }

    // 5. Single Open Shift Constraint
    const existingOpenShift = await this.prisma.attendanceRecord.findFirst({
      where: {
        workerId: worker.id,
        isOpen: true,
      },
      include: { mine: { select: { name: true, code: true } } },
    });

    if (existingOpenShift) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: `Worker already has an open check-in shift at mine "${existingOpenShift.mine.name}" (${existingOpenShift.mine.code}) since ${existingOpenShift.checkInAt.toISOString()}`,
      });
    }

    const businessDate = this.getBusinessDate(checkInAt);

    return this.prisma.attendanceRecord.create({
      data: {
        workerId: worker.id,
        mineId: mine.id,
        companyId: mine.companyId,
        businessDate,
        checkInAt,
        checkInLatitude: dto.latitude,
        checkInLongitude: dto.longitude,
        checkInMethod: dto.method || AttendanceMethod.MANUAL,
        recordedById: user.id,
        note: dto.note,
        isOpen: true,
      },
      include: {
        worker: {
          select: {
            id: true,
            displayName: true,
            employeeCode: true,
            employmentType: true,
          },
        },
        mine: { select: { id: true, name: true, code: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async checkOut(id: string, dto: CheckOutDto, user: RequestUser) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id },
      include: { mine: true },
    });

    if (!record) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Attendance record "${id}" not found`,
      });
    }

    if (!record.isOpen || record.checkOutAt) {
      throw new ConflictException({
        code: 'CONFLICT',
        message: 'Attendance record is already closed (checked out)',
      });
    }

    if (user.role === UserRole.MINE_OFFICIAL) {
      await this.scopeService.assertMineAccess(user, record.mineId);
    } else if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (dbUser?.companyId !== record.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot manage attendance for another company',
        });
      }
    }

    const checkOutAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    if (checkOutAt.getTime() < record.checkInAt.getTime()) {
      throw new UnprocessableEntityException({
        code: 'VALIDATION_ERROR',
        message: 'Check-out time cannot be earlier than check-in time',
      });
    }

    const updatedNote = dto.note
      ? record.note
        ? `${record.note} | Check-out: ${dto.note}`
        : dto.note
      : record.note;

    return this.prisma.attendanceRecord.update({
      where: { id },
      data: {
        checkOutAt,
        checkOutLatitude: dto.latitude,
        checkOutLongitude: dto.longitude,
        checkOutMethod: dto.method || AttendanceMethod.MANUAL,
        isOpen: false,
        note: updatedNote,
      },
      include: {
        worker: {
          select: {
            id: true,
            displayName: true,
            employeeCode: true,
            employmentType: true,
          },
        },
        mine: { select: { id: true, name: true, code: true } },
        recordedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. QUERY ATTENDANCE LIST & SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════

  async getAttendanceRecords(
    query: QueryAttendanceDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.AttendanceRecordWhereInput = {};

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

    if (query.mineId) {
      if (user.role === UserRole.MINE_OFFICIAL) {
        await this.scopeService.assertMineAccess(user, query.mineId);
      }
      where.mineId = query.mineId;
    }

    if (query.workerId) where.workerId = query.workerId;

    if (query.date) {
      where.businessDate = query.date;
    } else if (query.from || query.to) {
      where.businessDate = {};
      if (query.from) where.businessDate.gte = query.from;
      if (query.to) where.businessDate.lte = query.to;
    }

    if (query.status === AttendanceQueryStatus.OPEN) {
      where.isOpen = true;
    } else if (query.status === AttendanceQueryStatus.COMPLETED) {
      where.isOpen = false;
    }

    const [records, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { checkInAt: 'desc' },
        include: {
          worker: {
            include: {
              contractorWorker: {
                select: {
                  governmentIdMasked: true,
                  role: true,
                  contractor: { select: { id: true, legalName: true } },
                },
              },
            },
          },
          mine: { select: { id: true, name: true, code: true } },
          recordedBy: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);

    return {
      data: records,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getAttendanceSummary(query: AttendanceSummaryDto, user: RequestUser) {
    let mineIds: string[] = [];

    if (query.mineId) {
      if (user.role === UserRole.MINE_OFFICIAL) {
        await this.scopeService.assertMineAccess(user, query.mineId);
      }
      mineIds = [query.mineId];
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const accessible = await this.scopeService.getAccessibleMineIds(user);
      if (!accessible || accessible.length === 0) {
        return this.emptySummary(query);
      }
      mineIds = accessible;
    }

    const where: Prisma.AttendanceRecordWhereInput = {};
    if (mineIds.length > 0) {
      where.mineId = { in: mineIds };
    }

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    }

    const targetDate = query.date || (!query.from && !query.to ? this.getBusinessDate(new Date()) : undefined);

    if (targetDate) {
      where.businessDate = targetDate;
    } else {
      where.businessDate = {};
      if (query.from) where.businessDate.gte = query.from;
      if (query.to) where.businessDate.lte = query.to;
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        worker: {
          include: {
            contractorWorker: {
              include: { contractor: { select: { id: true, legalName: true } } },
            },
          },
        },
      },
    });

    const uniqueWorkerIds = new Set<string>();
    let totalCheckedOut = 0;
    let currentlyOnSite = 0;

    const employmentBreakdown = {
      EMPLOYEE: { totalCheckedIn: 0, currentlyOnSite: 0, distinctWorkers: new Set<string>() },
      CONTRACTOR: { totalCheckedIn: 0, currentlyOnSite: 0, distinctWorkers: new Set<string>() },
    };

    const contractorBreakdownMap = new Map<string, { contractorId: string; contractorName: string; onSiteCount: number; totalShifts: number }>();

    for (const r of records) {
      uniqueWorkerIds.add(r.workerId);
      if (r.checkOutAt) totalCheckedOut++;
      if (r.isOpen) currentlyOnSite++;

      const type = r.worker.employmentType;
      if (employmentBreakdown[type]) {
        employmentBreakdown[type].distinctWorkers.add(r.workerId);
        if (r.isOpen) employmentBreakdown[type].currentlyOnSite++;
      }

      if (type === EmploymentType.CONTRACTOR && r.worker.contractorWorker?.contractor) {
        const c = r.worker.contractorWorker.contractor;
        const entry = contractorBreakdownMap.get(c.id) || {
          contractorId: c.id,
          contractorName: c.legalName,
          onSiteCount: 0,
          totalShifts: 0,
        };
        entry.totalShifts++;
        if (r.isOpen) entry.onSiteCount++;
        contractorBreakdownMap.set(c.id, entry);
      }
    }

    employmentBreakdown.EMPLOYEE.totalCheckedIn = employmentBreakdown.EMPLOYEE.distinctWorkers.size;
    employmentBreakdown.CONTRACTOR.totalCheckedIn = employmentBreakdown.CONTRACTOR.distinctWorkers.size;

    return {
      window: {
        date: targetDate || null,
        from: query.from || null,
        to: query.to || null,
        timezone: 'Asia/Kolkata (IST)',
      },
      totalRecords: records.length,
      totalCheckedIn: uniqueWorkerIds.size,
      totalCheckedOut,
      currentlyOnSite,
      byEmploymentType: {
        EMPLOYEE: {
          totalCheckedIn: employmentBreakdown.EMPLOYEE.totalCheckedIn,
          currentlyOnSite: employmentBreakdown.EMPLOYEE.currentlyOnSite,
        },
        CONTRACTOR: {
          totalCheckedIn: employmentBreakdown.CONTRACTOR.totalCheckedIn,
          currentlyOnSite: employmentBreakdown.CONTRACTOR.currentlyOnSite,
        },
      },
      byContractor: Array.from(contractorBreakdownMap.values()),
      metricDefinitions: {
        totalCheckedIn: 'Count of distinct workers who initiated at least one check-in within the business date/range.',
        totalCheckedOut: 'Count of shifts that have completed check-out.',
        currentlyOnSite: 'Count of active open shifts (isOpen = true) with no check-out recorded.',
      },
    };
  }

  private emptySummary(query: AttendanceSummaryDto) {
    return {
      window: { date: query.date || null, from: query.from || null, to: query.to || null, timezone: 'Asia/Kolkata (IST)' },
      totalRecords: 0,
      totalCheckedIn: 0,
      totalCheckedOut: 0,
      currentlyOnSite: 0,
      byEmploymentType: { EMPLOYEE: { totalCheckedIn: 0, currentlyOnSite: 0 }, CONTRACTOR: { totalCheckedIn: 0, currentlyOnSite: 0 } },
      byContractor: [],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. UNIFIED WORKER PROFILES
  // ═══════════════════════════════════════════════════════════════════════════

  async createWorkerProfile(dto: CreateWorkerProfileDto, user: RequestUser) {
    let companyId: string;
    if (user.role === UserRole.ADMIN || user.role === UserRole.REGULATOR) {
      if (!dto.companyId) {
        throw new UnprocessableEntityException({
          code: 'VALIDATION_ERROR',
          message: 'companyId is required for administrator worker creation',
        });
      }
      companyId = dto.companyId;
    } else if (user.role === UserRole.CORPORATE) {
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
      companyId = dbUser.companyId;
    } else {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'Only corporate managers and administrators can create worker profiles',
      });
    }

    if (dto.employeeCode) {
      const existing = await this.prisma.worker.findUnique({
        where: {
          companyId_employeeCode: {
            companyId,
            employeeCode: dto.employeeCode,
          },
        },
      });
      if (existing) {
        throw new ConflictException({
          code: 'CONFLICT',
          message: `Worker with employee code "${dto.employeeCode}" already exists in this company`,
        });
      }
    }

    return this.prisma.worker.create({
      data: {
        companyId,
        displayName: dto.displayName,
        employeeCode: dto.employeeCode,
        phone: dto.phone,
        employmentType: dto.employmentType || EmploymentType.EMPLOYEE,
        userId: dto.userId,
        status: WorkerStatus.ACTIVE,
      },
      include: {
        company: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async getWorkers(
    query: QueryWorkersDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.WorkerWhereInput = {};

    if (user.role === UserRole.CORPORATE) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (user.role === UserRole.MINE_OFFICIAL) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      where.companyId = dbUser?.companyId || 'invalid';
    } else if (query.companyId) {
      where.companyId = query.companyId;
    }

    if (query.employmentType) where.employmentType = query.employmentType;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { displayName: { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [workers, total] = await Promise.all([
      this.prisma.worker.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { displayName: 'asc' },
        include: {
          company: { select: { id: true, name: true, code: true } },
          contractorWorker: {
            select: {
              governmentIdMasked: true,
              role: true,
              contractor: { select: { id: true, legalName: true } },
            },
          },
        },
      }),
      this.prisma.worker.count({ where }),
    ]);

    return {
      data: workers,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getWorker(id: string, user: RequestUser) {
    const worker = await this.prisma.worker.findUnique({
      where: { id },
      include: {
        company: { select: { id: true, name: true, code: true } },
        contractorWorker: {
          include: {
            contractor: true,
            assignments: {
              include: { mine: { select: { id: true, name: true, code: true } } },
            },
          },
        },
        attendanceRecords: {
          take: 10,
          orderBy: { checkInAt: 'desc' },
          include: { mine: { select: { id: true, name: true, code: true } } },
        },
      },
    });

    if (!worker) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Worker "${id}" not found`,
      });
    }

    if (user.role === UserRole.CORPORATE || user.role === UserRole.MINE_OFFICIAL) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });
      if (dbUser?.companyId !== worker.companyId) {
        throw new ForbiddenException({
          code: 'FORBIDDEN',
          message: 'You cannot view workers from another company',
        });
      }
    }

    return worker;
  }
}
