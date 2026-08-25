import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ComplianceCategory, ComplianceStatus } from '@prisma/client';

export class QueryComplianceReportsDto extends PaginationDto {
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
