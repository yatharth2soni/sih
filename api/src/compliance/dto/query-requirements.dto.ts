import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ComplianceCategory, ApplicableTo } from '@prisma/client';

export class QueryRequirementsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ComplianceCategory)
  category?: ComplianceCategory;

  @IsOptional()
  @IsEnum(ApplicableTo)
  applicableTo?: ApplicableTo;

  @IsOptional()
  @IsBooleanString()
  active?: string;
}
