import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ContractStatus } from '@prisma/client';

export class QueryContractsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  contractorId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsDateString()
  asOf?: string;
}
