import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateMineDto {
  @IsString()
  @IsNotEmpty()
  companyId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsObject()
  @IsOptional()
  geoBoundary?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  status?: string;
}
