import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MinesService } from './mines.service';
import { GisService } from '../gis/gis.service';
import { CreateMineDto } from './dto/create-mine.dto';
import { UpdateMineDto } from './dto/update-mine.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';
import { UserRole } from '@prisma/client';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class MinesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  companyId?: string;
}

class NearbyMinesQueryDto {
  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  longitude!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radiusKm?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}

class LocationContextQueryDto {
  @Type(() => Number)
  @IsNumber()
  latitude!: number;

  @Type(() => Number)
  @IsNumber()
  longitude!: number;
}

@Controller('mines')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MinesController {
  constructor(
    private readonly minesService: MinesService,
    private readonly gisService: GisService,
  ) {}

  @Get('nearby')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE, UserRole.MINE_OFFICIAL)
  async findNearby(
    @Query() query: NearbyMinesQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.gisService.findNearbyMines(
      query.latitude,
      query.longitude,
      query.radiusKm,
      query.limit,
      user,
    );
  }

  @Get(':id/location-context')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE, UserRole.MINE_OFFICIAL)
  async getLocationContext(
    @Param('id') id: string,
    @Query() query: LocationContextQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.gisService.getLocationContext(
      id,
      query.latitude,
      query.longitude,
      user,
    );
    return { data };
  }

  @Get()
  async findAll(@Query() query: MinesQueryDto) {
    return this.minesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const mine = await this.minesService.findOne(id);
    return { data: mine };
  }

  @Post()
  async create(@Body() dto: CreateMineDto) {
    const mine = await this.minesService.create(dto);
    return { data: mine };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMineDto) {
    const mine = await this.minesService.update(id, dto);
    return { data: mine };
  }
}

