import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OcrJobStatus, OcrTargetType } from '@prisma/client';

export class QueryOcrJobsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OcrJobStatus)
  status?: OcrJobStatus;

  @IsOptional()
  @IsUUID()
  attachmentId?: string;

  @IsOptional()
  @IsEnum(OcrTargetType)
  targetType?: OcrTargetType;
}
