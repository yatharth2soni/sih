import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
} from 'class-validator';
import { ComplianceCategory } from '@prisma/client';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;

  @IsEnum(ComplianceCategory)
  @IsOptional()
  category?: ComplianceCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsNotEmpty()
  checklist!: Array<Record<string, unknown>>;
}
