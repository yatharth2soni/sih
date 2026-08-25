import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { EmploymentType, WorkerStatus } from '@prisma/client';

export class CreateWorkerProfileDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  employeeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType = EmploymentType.EMPLOYEE;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
