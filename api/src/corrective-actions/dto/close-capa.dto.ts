import { IsNotEmpty, IsString } from 'class-validator';

export class CloseCapaDto {
  @IsString()
  @IsNotEmpty()
  closureNote!: string;
}
