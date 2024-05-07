import { Module } from '@nestjs/common';
import { notificationProviders } from './notification.provider';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [NotificationController],
  providers: [...notificationProviders, NotificationService],
})
export class NotificationModule {}
