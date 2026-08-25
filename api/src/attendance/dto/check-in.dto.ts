import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { AttendanceMethod } from '@prisma/client';

export class CheckInDto {
  @IsNotEmpty()
  @IsUUID()
  workerId!: string;

  @IsNotEmpty()
  @IsUUID()
  mineId!: string;

  @IsOptional()
  @IsDateString()
  occurredAt?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsEnum(AttendanceMethod)
  method?: AttendanceMethod;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
