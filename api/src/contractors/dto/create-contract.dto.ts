import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  contractNumber!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsUUID()
  mineId?: string; // Optional (company-wide if null)

  @IsOptional()
  @IsObject()
  scopeOfWork?: Record<string, any>;
}
