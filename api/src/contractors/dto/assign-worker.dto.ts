import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class AssignWorkerDto {
  @IsNotEmpty()
  @IsUUID()
  workerId!: string;

  @IsOptional()
  @IsUUID()
  mineId?: string;
}

export class UnassignWorkerDto {
  @IsNotEmpty()
  @IsUUID()
  workerId!: string;
}
