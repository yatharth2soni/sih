import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { GrievanceCategory, GrievancePriority } from '@prisma/client';

export class CreateGrievanceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  subject!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsNotEmpty()
  @IsEnum(GrievanceCategory)
  category!: GrievanceCategory;

  @IsOptional()
  @IsEnum(GrievancePriority)
  priority?: GrievancePriority = GrievancePriority.MEDIUM;

  @IsOptional()
  @IsUUID()
  mineId?: string; // Optional: company-level grievance if null

  @IsOptional()
  @IsUUID()
  companyId?: string; // Optional: derived from caller or mine
}
