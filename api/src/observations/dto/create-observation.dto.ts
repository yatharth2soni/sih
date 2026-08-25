import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ComplianceCategory, ObservationSeverity, FindingType } from '@prisma/client';

export class CreateObservationItemDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(ComplianceCategory)
  @IsOptional()
  category?: ComplianceCategory;

  @IsEnum(ObservationSeverity)
  @IsOptional()
  severity?: ObservationSeverity;

  @IsEnum(FindingType)
  @IsOptional()
  findingType?: FindingType;

  @IsUUID()
  @IsOptional()
  complianceRequirementId?: string;

  @IsUUID()
  @IsOptional()
  complianceRecordId?: string;

  @IsBoolean()
  @IsOptional()
  isViolationCandidate?: boolean;
}

export class CreateObservationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateObservationItemDto)
  observations!: CreateObservationItemDto[];
}
