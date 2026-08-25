import { IsOptional, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class AcknowledgeAnomalyDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class ResolveAnomalyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}

export class DismissAnomalyDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
