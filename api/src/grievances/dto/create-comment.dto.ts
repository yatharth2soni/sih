import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { CommentVisibility } from '@prisma/client';

export class CreateGrievanceCommentDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(3000)
  body!: string;

  @IsOptional()
  @IsEnum(CommentVisibility)
  visibility?: CommentVisibility = CommentVisibility.REPORTER_AND_HANDLERS;
}
