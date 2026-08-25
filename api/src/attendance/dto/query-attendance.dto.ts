import { IsOptional, IsUUID, IsDateString, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export enum AttendanceQueryStatus {
  OPEN = 'OPEN',
  COMPLETED = 'COMPLETED',
}

export class QueryAttendanceDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  mineId?: string;

  @IsOptional()
  @IsUUID()
  workerId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsDateString()
  date?: string; // specific businessDate "YYYY-MM-DD"

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(AttendanceQueryStatus)
  status?: AttendanceQueryStatus;
}
