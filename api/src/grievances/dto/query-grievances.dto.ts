import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import {
  GrievanceStatus,
  GrievancePriority,
  GrievanceCategory,
} from '@prisma/client';

export class QueryGrievancesDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(GrievanceStatus)
  status?: GrievanceStatus;

  @IsOptional()
  @IsEnum(GrievancePriority)
  priority?: GrievancePriority;

  @IsOptional()
  @IsEnum(GrievanceCategory)
  category?: GrievanceCategory;

  @IsOptional()
  @IsUUID()
  reporterId?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @IsOptional()
  @IsDateString()
  dueBefore?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
