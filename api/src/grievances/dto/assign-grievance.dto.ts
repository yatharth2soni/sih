import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignGrievanceDto {
  @IsNotEmpty()
  @IsUUID()
  assignedToId!: string;
}
