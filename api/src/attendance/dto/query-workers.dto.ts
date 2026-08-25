import { IsOptional, IsUUID, IsEnum, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EmploymentType, WorkerStatus } from '@prisma/client';

export class QueryWorkersDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsEnum(WorkerStatus)
  status?: WorkerStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
