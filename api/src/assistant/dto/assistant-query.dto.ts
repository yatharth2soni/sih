import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';

export enum AssistantLanguage {
  EN = 'en',
  HI = 'hi',
}

export class AssistantQueryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3, { message: 'Question must be at least 3 characters' })
  @MaxLength(500, { message: 'Question cannot exceed 500 characters' })
  question!: string;

  @IsOptional()
  @IsEnum(AssistantLanguage, { message: 'Supported languages are "en" (English) and "hi" (Hindi)' })
  language?: AssistantLanguage;

  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
