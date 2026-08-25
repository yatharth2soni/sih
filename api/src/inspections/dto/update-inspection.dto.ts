import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { InspectionStatus } from '@prisma/client';

export class UpdateInspectionDto {
  @IsDateString()
  @IsOptional()
  scheduledFor?: string;

  @IsString()
  @IsOptional()
  purpose?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsEnum(InspectionStatus)
  @IsOptional()
  status?: InspectionStatus;
}
