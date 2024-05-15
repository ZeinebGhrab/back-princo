import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';
import { CreateNotificationDto } from './dto/createNotification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('notification')
@UseGuards(JwtAuthGuard)
@Roles(Role.User)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get(':userId')
  async showNotifications(
    @Param('userId') userId: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ) {
    try {
      return this.notificationService.showNotifications(userId, skip, limit);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  async createNotification(notification: CreateNotificationDto) {
    this.notificationService.createNotification(notification);
  }

  @Cron(CronExpression.EVERY_6_MONTHS)
  async deleteNotificationGreaterThanSixMonth() {
    await this.notificationService.deleteNotification();
  }
}
