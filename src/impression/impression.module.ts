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
    ...connectorProviders,
    ...userProviders,
    ...notificationProviders,
  ],
})
export class ImpressionModule {}