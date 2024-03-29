import { DatabaseModule } from 'src/database/database.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Module } from '@nestjs/common';
import { userProviders } from './user.providers';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
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
  providers: [UserService, ...userProviders],
  controllers: [UserController],
})
export class UserModule {}
