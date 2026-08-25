import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class TerminateContractDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
