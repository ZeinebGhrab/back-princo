import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { invoiceProviders } from './invoice.provider';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { offerProviders } from 'src/offer/offer.provider';
import { userProviders } from 'src/user/user.providers';

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
  controllers: [InvoiceController],
  providers: [
    InvoiceService,
    ...invoiceProviders,
    ...offerProviders,
    ...userProviders,
  ],
})
export class InvoiceModule {}
