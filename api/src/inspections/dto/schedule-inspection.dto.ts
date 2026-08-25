import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class ScheduleInspectionDto {
  @IsUUID()
  @IsNotEmpty()
  mineId!: string;

  @IsUUID()
  @IsOptional()
  templateId?: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledFor!: string;

  @IsString()
  @IsOptional()
  purpose?: string;
}
