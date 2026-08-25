import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ObservationsService } from './observations.service';
import {
  CreateObservationItemDto,
  CreateObservationsDto,
} from './dto/create-observation.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) {}

  @Post('inspections/:inspectionId/observations')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('inspectionId') inspectionId: string,
    @Body() body: CreateObservationsDto | CreateObservationItemDto | CreateObservationItemDto[],
    @CurrentUser() user: RequestUser,
  ) {
    let items: CreateObservationItemDto[];
    if (Array.isArray(body)) {
      items = body;
    } else if ('observations' in body && Array.isArray(body.observations)) {
      items = body.observations;
    } else {
      items = [body as CreateObservationItemDto];
    }

    const observations = await this.observationsService.createMany(
      inspectionId,
      items,
      user,
    );
    return { data: observations };
  }

  @Patch('observations/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateObservationDto,
    @CurrentUser() user: RequestUser,
  ) {
    const observation = await this.observationsService.update(id, dto, user);
    return { data: observation };
  }
}
