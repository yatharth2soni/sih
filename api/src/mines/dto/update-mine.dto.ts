import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateMineDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsObject()
  @IsOptional()
  geoBoundary?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  status?: string;
}
