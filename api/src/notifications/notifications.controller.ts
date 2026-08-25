import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/services/scope.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @Query() query: QueryNotificationsDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.notificationsService.getUserNotifications(user.id, query);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: RequestUser) {
    const result = await this.notificationsService.getUnreadCount(user.id);
    return { data: result };
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ) {
    const notification = await this.notificationsService.markAsRead(id, user.id);
    return { data: notification };
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: RequestUser) {
    const result = await this.notificationsService.markAllAsRead(user.id);
    return { data: result };
  }
}
