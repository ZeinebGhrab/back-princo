import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Notification } from 'src/notification/schemas/notification.schema';
import { CreateNotificationDto } from '../notification/dto/createNotification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NOTIFICATION_MODEL')
    private readonly notificationModel: Model<Notification>,
  ) {}

  async showNotifications(user: string, skip: string, limit: string) {
    const notifications = this.notificationModel
      .find({
        user,
        date: { $gt: new Date().setDate(new Date().getDate() - 2) },
      })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    return notifications;
  }

  async createNotification(notification: CreateNotificationDto) {
    await this.notificationModel.create(notification);
  }

  async deleteNotification() {
    await this.notificationModel.deleteMany({
      date: { $gt: new Date().setDate(new Date().getDate() - 180) },
    });
  }
}
