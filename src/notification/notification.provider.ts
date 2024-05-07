import { Connection } from 'mongoose';
import { NotificationSchema } from './schemas/notification.schema';

export const notificationProviders = [
  {
    provide: 'NOTIFICATION_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Notification', NotificationSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
