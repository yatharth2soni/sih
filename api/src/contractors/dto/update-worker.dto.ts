import {
  IsOptional,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { WorkerStatus } from '@prisma/client';

export class UpdateWorkerDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;

  @IsOptional()
  @IsEnum(WorkerStatus)
  status?: WorkerStatus;
}
