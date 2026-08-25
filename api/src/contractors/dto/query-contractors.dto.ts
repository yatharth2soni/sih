import { IsOptional, IsEnum, IsUUID, IsString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ContractorStatus } from '@prisma/client';

export class QueryContractorsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(ContractorStatus)
  status?: ContractorStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
