import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EscalateGrievanceDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  reason!: string;
}
