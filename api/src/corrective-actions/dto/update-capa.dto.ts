import {
  IsOptional,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class UpdateCapaDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsDateString()
  @IsOptional()
  dueAt?: string;
}
