import { IsOptional, IsBoolean, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryNotificationsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true || value === '1')
  unreadOnly?: boolean;

  @IsOptional()
  @IsDateString()
  since?: string; // ISO date; filter notifications with createdAt > since (exclusive)

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize?: number = 20;
}
