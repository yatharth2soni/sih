import { IsNotEmpty, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ComplianceCategory, ComplianceStatus } from '@prisma/client';

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx',
}

export class ExportReportDto {
  @IsEnum(ExportFormat)
  @IsNotEmpty()
  format!: ExportFormat;

  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(ComplianceCategory)
  category?: ComplianceCategory;

  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
