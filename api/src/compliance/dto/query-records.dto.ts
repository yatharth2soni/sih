import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ComplianceStatus } from '@prisma/client';

export class QueryRecordsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @IsOptional()
  @IsString()
  requirementId?: string;
}
