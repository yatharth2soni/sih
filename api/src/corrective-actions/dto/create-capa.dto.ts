import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateCapaDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsUUID()
  @IsNotEmpty()
  assignedToId!: string;

  @IsDateString()
  @IsNotEmpty()
  dueAt!: string;
}
