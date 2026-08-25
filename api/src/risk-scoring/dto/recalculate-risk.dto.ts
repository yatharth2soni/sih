import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class RecalculateRiskDto {
  @IsOptional()
  @IsDateString()
  now?: string;

  @IsOptional()
  @IsUUID()
  mineId?: string;
}
