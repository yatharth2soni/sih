import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class VerifyAuditChainDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  fromSequence?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  toSequence?: number;
}
