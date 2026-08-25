import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ComplianceStatus } from '@prisma/client';

export class UpdateRecordDto {
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsDateString()
  lastCheckedAt?: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;
}
