import { IsOptional, IsDateString } from 'class-validator';

export class TriggerScanDto {
  @IsOptional()
  @IsDateString()
  now?: string; // Optional clock injection for deterministic simulation
}
