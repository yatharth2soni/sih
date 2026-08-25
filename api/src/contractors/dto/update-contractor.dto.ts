import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ContractorStatus } from '@prisma/client';

export class UpdateContractorDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tradeName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @IsOptional()
  @IsEnum(ContractorStatus)
  status?: ContractorStatus;
}
