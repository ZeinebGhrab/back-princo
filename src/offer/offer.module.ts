import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { OfferController } from './offer.controller';
import { offerProviders } from './offer.provider';
import { OfferService } from './offer.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  controllers: [OfferController],
  providers: [OfferService, ...offerProviders],
})
export class OfferModule {}
