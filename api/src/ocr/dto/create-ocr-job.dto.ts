import {
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsArray,
  IsString,
} from 'class-validator';
import { OcrTargetType } from '@prisma/client';

export class CreateOcrJobDto {
  @IsNotEmpty()
  @IsString()
  attachmentId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languageHints?: string[];

  @IsOptional()
  @IsEnum(OcrTargetType)
  targetType?: OcrTargetType;

  @IsOptional()
  @IsString()
  targetId?: string;
}
