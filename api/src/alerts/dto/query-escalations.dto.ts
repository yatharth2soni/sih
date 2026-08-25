import { IsOptional, IsString, IsEnum, IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { EscalationOutcome } from '@prisma/client';

export class QueryEscalationsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  resourceType?: string;

  @IsOptional()
  @IsString()
  ruleKey?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  stage?: number;

  @IsOptional()
  @IsEnum(EscalationOutcome)
  outcome?: EscalationOutcome;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
