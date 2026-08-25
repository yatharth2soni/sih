import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
} from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  recipientId!: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type!: NotificationType;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  body!: string;

  @IsString()
  @IsNotEmpty()
  resourceType!: string;

  @IsString()
  @IsNotEmpty()
  resourceId!: string;

  @IsString()
  @IsOptional()
  severity?: string = 'INFO';

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
