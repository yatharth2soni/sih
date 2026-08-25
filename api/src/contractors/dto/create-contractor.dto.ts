import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';

export class CreateContractorDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  legalName!: string;

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
  @IsUUID()
  companyId?: string; // Required if caller is ADMIN, otherwise defaults to caller's companyId
}
