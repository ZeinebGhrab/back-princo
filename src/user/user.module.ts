import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Facture, FactureSchema } from '../auth/schemas/facture.schema';
import { PassportModule } from '@nestjs/passport'; // Import PassportModule
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule
import { JwtStrategy } from '../auth/autorization.strategy'; // Import JwtStrategy

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('SECRET_NAME'),
        signOptions: {
          expiresIn: config.get<string | number>('EXPIRATION'),
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Facture.name, schema: FactureSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
