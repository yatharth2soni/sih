import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class ResolveGrievanceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(3000)
  resolutionNote!: string;
}

export class ReopenGrievanceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}

export class CloseGrievanceDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
