import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateWorkerDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  fullName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  employeeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  governmentId?: string; // Privacy: converted to SHA-256 hash & masked string in backend

  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}
