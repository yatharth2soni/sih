import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScopeService, RequestUser } from '../common/services/scope.service';
import { QueryComplianceReportsDto } from './dto/query-reports.dto';
import { ExportReportDto, ExportFormat } from './dto/export-report.dto';
import { PaginatedResponse } from '../common/dto/pagination.dto';
import * as ExcelJS from 'exceljs';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private scopeService: ScopeService,
  ) {}

  /**
   * Spreadsheet Formula Injection Sanitizer:
   * Prevents CSV/Excel command execution by escaping dangerous leading characters.
   */
  public sanitizeFormula(value: any): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
    if (str.length > 0 && dangerousChars.includes(str.charAt(0))) {
      return `'${str}`;
    }
    return str;
  }

  /**
   * Tabular Compliance Report (Paginated & Scoped)
   */
  async getComplianceReport(
    query: QueryComplianceReportsDto,
    user: RequestUser,
  ): Promise<PaginatedResponse<any>> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.ComplianceRecordWhereInput = {};

    if (accessibleMineIds !== null) {
      if (query.mineId) {
        if (!accessibleMineIds.includes(query.mineId)) {
          return { data: [], meta: { page, pageSize, total: 0, totalPages: 0 } };
        }
        where.mineId = query.mineId;
      } else {
        where.mineId = { in: accessibleMineIds };
      }
    } else if (query.mineId) {
      where.mineId = query.mineId;
    }

    if (query.companyId) {
      where.mine = { companyId: query.companyId };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.requirement = { category: query.category };
    }

    if (query.from || query.to) {
      where.lastCheckedAt = {};
      if (query.from) where.lastCheckedAt.gte = new Date(query.from);
      if (query.to) where.lastCheckedAt.lte = new Date(query.to);
    }

    const [records, total] = await Promise.all([
      this.prisma.complianceRecord.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
        include: {
          mine: {
            select: {
              id: true,
              name: true,
              code: true,
              company: { select: { id: true, name: true, code: true } },
            },
          },
          requirement: true,
        },
      }),
      this.prisma.complianceRecord.count({ where }),
    ]);

    const data = records.map((r) => ({
      id: r.id,
      companyName: r.mine.company.name,
      companyCode: r.mine.company.code,
      mineName: r.mine.name,
      mineCode: r.mine.code,
      requirementTitle: r.requirement.title,
      category: r.requirement.category,
      frequency: r.requirement.frequency,
      status: r.status,
      remarks: r.remarks,
      lastCheckedAt: r.lastCheckedAt,
      nextDueAt: r.nextDueAt,
      updatedAt: r.updatedAt,
    }));

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Statutory Report Export (CSV or XLSX)
   */
  async exportStatutoryReport(
    dto: ExportReportDto,
    user: RequestUser,
  ): Promise<{ buffer: Buffer; filename: string; mimeType: string }> {
    const accessibleMineIds = await this.scopeService.getAccessibleMineIds(user);

    // Validate max date range (<= 365 days)
    if (dto.from && dto.to) {
      const diffDays =
        (new Date(dto.to).getTime() - new Date(dto.from).getTime()) /
        (1000 * 3600 * 24);
      if (diffDays > 365) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Export date range cannot exceed 365 days',
        });
      }
    }

    const where: Prisma.ComplianceRecordWhereInput = {};

    if (accessibleMineIds !== null) {
      if (dto.mineId) {
        if (!accessibleMineIds.includes(dto.mineId)) {
          throw new BadRequestException({
            code: 'FORBIDDEN',
            message: 'You do not have access to export data for this mine',
          });
        }
        where.mineId = dto.mineId;
      } else {
        where.mineId = { in: accessibleMineIds };
      }
    } else if (dto.mineId) {
      where.mineId = dto.mineId;
    }

    if (dto.companyId) {
      where.mine = { companyId: dto.companyId };
    }

    if (dto.status) {
      where.status = dto.status;
    }

    if (dto.category) {
      where.requirement = { category: dto.category };
    }

    if (dto.from || dto.to) {
      where.lastCheckedAt = {};
      if (dto.from) where.lastCheckedAt.gte = new Date(dto.from);
      if (dto.to) where.lastCheckedAt.lte = new Date(dto.to);
    }

    // Fetch bounded rows (up to 5000)
    const records = await this.prisma.complianceRecord.findMany({
      where,
      take: 5000,
      orderBy: { updatedAt: 'desc' },
      include: {
        mine: {
          include: { company: true },
        },
        requirement: true,
      },
    });

    const timestampStr = new Date().toISOString().split('T')[0];
    const filename = `statutory-compliance-report-${timestampStr}.${dto.format}`;

    const headers = [
      'Company Code',
      'Company Name',
      'Mine Code',
      'Mine Name',
      'Category',
      'Requirement Title',
      'Frequency',
      'Status',
      'Remarks',
      'Last Checked At',
      'Next Due At',
    ];

    const rows = records.map((r) => [
      this.sanitizeFormula(r.mine.company.code),
      this.sanitizeFormula(r.mine.company.name),
      this.sanitizeFormula(r.mine.code),
      this.sanitizeFormula(r.mine.name),
      this.sanitizeFormula(r.requirement.category),
      this.sanitizeFormula(r.requirement.title),
      this.sanitizeFormula(r.requirement.frequency),
      this.sanitizeFormula(r.status),
      this.sanitizeFormula(r.remarks || ''),
      r.lastCheckedAt ? r.lastCheckedAt.toISOString() : '',
      r.nextDueAt ? r.nextDueAt.toISOString() : '',
    ]);

    if (dto.format === ExportFormat.CSV) {
      // Generate standard RFC 4180 CSV
      const csvLines: string[] = [];
      csvLines.push(headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','));

      for (const row of rows) {
        csvLines.push(
          row
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(','),
        );
      }

      const buffer = Buffer.from(csvLines.join('\r\n'), 'utf-8');
      return {
        buffer,
        filename,
        mimeType: 'text/csv; charset=utf-8',
      };
    } else {
      // Generate binary XLSX workbook via ExcelJS
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Khanan Suraksha Governance Platform';
      workbook.created = new Date();

      const sheet = workbook.addWorksheet('Statutory Compliance');
      sheet.addRow(headers);

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      for (const row of rows) {
        sheet.addRow(row);
      }

      // Auto-fit column widths
      sheet.columns.forEach((column) => {
        column.width = 24;
      });

      const arrayBuffer = await workbook.xlsx.writeBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return {
        buffer,
        filename,
        mimeType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }
  }
}
