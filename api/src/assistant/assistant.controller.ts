import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { AssistantQueryDto } from './dto/assistant-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';
import { UserRole } from '@prisma/client';

@Controller('assistant')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE, UserRole.MINE_OFFICIAL)
  async query(
    @Body() dto: AssistantQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    const data = await this.assistantService.processQuery(dto, user);
    return { data };
  }

  @Get('capabilities')
  @Roles(UserRole.ADMIN, UserRole.REGULATOR, UserRole.CORPORATE, UserRole.MINE_OFFICIAL)
  async getCapabilities() {
    const data = this.assistantService.getCapabilities();
    return { data };
  }
}
