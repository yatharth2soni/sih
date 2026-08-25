import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsEnum,
  IsString,
} from 'class-validator';
import { OcrTargetType } from '@prisma/client';

export class LinkTargetDto {
  @IsNotEmpty()
  @IsEnum(OcrTargetType)
  type!: OcrTargetType;

  @IsNotEmpty()
  @IsString()
  id!: string;
}

export class ReviewOcrJobDto {
  @IsNotEmpty()
  @IsObject()
  correctedFields!: Record<string, any>;

  @IsOptional()
  @IsObject()
  linkTarget?: LinkTargetDto;
}
