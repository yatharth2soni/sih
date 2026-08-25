import { IsOptional, IsString, IsEnum, IsDateString, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InspectionStatus } from '@prisma/client';

export class QueryInspectionsDto extends PaginationDto {
  @IsUUID()
  @IsOptional()
  mineId?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;

  @IsUUID()
  @IsOptional()
  conductedById?: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}
