import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ViolationsService } from './violations.service';
import { RaiseViolationDto } from './dto/raise-violation.dto';
import { QueryViolationsDto } from './dto/query-violations.dto';
import { UpdateViolationDto } from './dto/update-violation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class ViolationsController {
  constructor(private readonly violationsService: ViolationsService) {}

  @Post('observations/:observationId/violation')
  @HttpCode(HttpStatus.CREATED)
  async raiseViolation(
    @Param('observationId') observationId: string,
    @Body() dto: RaiseViolationDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.violationsService.raiseFromObservation(
      observationId,
      dto,
      user,
    );
    return { data: result.violation, complianceRecordUpdated: result.complianceRecordUpdated };
  }

  @Get('violations')
  async findAll(
    @Query() query: QueryViolationsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.violationsService.findAll(query, user);
  }

  @Get('violations/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const violation = await this.violationsService.findOne(id, user);
    return { data: violation };
  }

  @Patch('violations/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateViolationDto,
    @CurrentUser() user: RequestUser,
  ) {
    const violation = await this.violationsService.update(id, dto, user);
    return { data: violation };
  }
}
