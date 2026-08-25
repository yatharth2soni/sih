import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ViolationStatus } from '@prisma/client';

export class UpdateViolationDto {
  @IsEnum(ViolationStatus)
  @IsOptional()
  status?: ViolationStatus;

  @IsString()
  @IsOptional()
  resolutionNote?: string;
}
