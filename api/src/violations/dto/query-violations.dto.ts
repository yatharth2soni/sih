import { IsOptional, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ViolationStatus, ObservationSeverity } from '@prisma/client';

export class QueryViolationsDto extends PaginationDto {
  @IsUUID()
  @IsOptional()
  mineId?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsEnum(ViolationStatus)
  @IsOptional()
  status?: ViolationStatus;

  @IsEnum(ObservationSeverity)
  @IsOptional()
  severity?: ObservationSeverity;

  @IsUUID()
  @IsOptional()
  requirementId?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
