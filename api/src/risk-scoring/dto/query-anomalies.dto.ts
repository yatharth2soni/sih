import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AnomalyType, AnomalyStatus } from '@prisma/client';

export class QueryAnomaliesDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(AnomalyStatus)
  status?: AnomalyStatus;

  @IsOptional()
  @IsEnum(AnomalyType)
  type?: AnomalyType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
