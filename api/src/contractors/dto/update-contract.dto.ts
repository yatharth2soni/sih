import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsObject,
  MaxLength,
} from 'class-validator';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsObject()
  scopeOfWork?: Record<string, any>;
}
