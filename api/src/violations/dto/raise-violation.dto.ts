import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ObservationSeverity } from '@prisma/client';

export class RaiseViolationDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ObservationSeverity)
  @IsOptional()
  severity?: ObservationSeverity;

  @IsUUID()
  @IsOptional()
  complianceRequirementId?: string;

  @IsUUID()
  @IsOptional()
  complianceRecordId?: string;

  @IsBoolean()
  @IsOptional()
  markComplianceRecordNonCompliant?: boolean;
}
