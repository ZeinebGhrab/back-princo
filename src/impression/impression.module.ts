import { Module } from '@nestjs/common';
import { ImpressionController } from './impression.controller';
import { ImpressionService } from './impression.service';
import { ImpressionNotificationGateway } from './impression-notification-gateway';
import { connectorProviders } from 'src/connector/connector.providers';
import { userProviders } from 'src/user/user.providers';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { notificationProviders } from 'src/notification/notification.provider';
import { NotificationService } from 'src/notification/notification.service';
import { pendingFilesProviders } from 'src/pending-files/pendilg-files.provider';
import { PendingFilesService } from 'src/pending-files/pending-files.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [ImpressionController],
  providers: [
    ImpressionService,
    ImpressionNotificationGateway,
    NotificationService,
    PendingFilesService,
    ...connectorProviders,
    ...userProviders,
    ...notificationProviders,
    ...pendingFilesProviders,
  ],
})
export class ImpressionModule {}
