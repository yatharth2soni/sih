import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class AttendanceSummaryDto {
  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsDateString()
  date?: string; // "YYYY-MM-DD"

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
