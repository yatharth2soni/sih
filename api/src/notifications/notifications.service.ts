import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { Notification, Prisma } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create and deliver an immutable in-app notification.
   */
  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        recipientId: dto.recipientId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        resourceType: dto.resourceType,
        resourceId: dto.resourceId,
        severity: dto.severity || 'INFO',
        metadata: dto.metadata || Prisma.JsonNull,
      },
    });
  }

  /**
   * Get paginated notifications for current user with unreadOnly and exclusive `since` filters.
   */
  async getUserNotifications(
    userId: string,
    query: QueryNotificationsDto,
  ): Promise<{ data: Notification[]; meta: any }> {
    const page = query.page || 1;
    const pageSize = query.limit || query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: Prisma.NotificationWhereInput = {
      recipientId: userId,
    };

    if (query.unreadOnly) {
      where.readAt = null;
    }

    if (query.since) {
      // Exclusive timestamp semantic: createdAt > since
      where.createdAt = {
        gt: new Date(query.since),
      };
    }

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { recipientId: userId, readAt: null },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        unreadCount,
      },
    };
  }

  /**
   * Get total unread count for current user.
   */
  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.prisma.notification.count({
      where: {
        recipientId: userId,
        readAt: null,
      },
    });
    return { unreadCount };
  }

  /**
   * Mark a single notification as read (idempotent; validates recipient isolation).
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: `Notification "${id}" not found`,
      });
    }

    if (notification.recipientId !== userId) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You cannot mark another user\'s notification as read',
      });
    }

    if (notification.readAt) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }

  /**
   * Mark all unread notifications for current user as read (idempotent).
   */
  async markAllAsRead(userId: string): Promise<{ updatedCount: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        recipientId: userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }
}
