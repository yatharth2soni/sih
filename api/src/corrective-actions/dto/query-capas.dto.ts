import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CapaStatus } from '@prisma/client';

export class QueryCapasDto extends PaginationDto {
  @IsUUID()
  @IsOptional()
  mineId?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsUUID()
  @IsOptional()
  violationId?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsEnum(CapaStatus)
  @IsOptional()
  status?: CapaStatus;

  @IsDateString()
  @IsOptional()
  dueBefore?: string;

  @IsDateString()
  @IsOptional()
  dueAfter?: string;
}
