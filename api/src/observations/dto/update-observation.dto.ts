import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ComplianceCategory, ObservationSeverity, FindingType } from '@prisma/client';

export class UpdateObservationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

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
