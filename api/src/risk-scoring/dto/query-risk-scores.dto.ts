import { IsOptional, IsEnum, IsUUID, IsDateString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { RiskBand } from '@prisma/client';

export class QueryRiskScoresDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsEnum(RiskBand)
  band?: RiskBand;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  latestOnly?: boolean;
}
