import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DatabaseModule } from 'src/database/database.module';
import { offerProviders } from 'src/offer/offer.provider';
import { userProviders } from 'src/user/user.providers';
import { paymentProviders, stripeProviders } from './payment.providers';
import { invoiceProviders } from 'src/invoice/invoice.provider';
import { InvoiceService } from 'src/invoice/invoice.service';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

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
  controllers: [PaymentController],
  providers: [
    PaymentService,
    ...paymentProviders,
    ...stripeProviders,
    ...userProviders,
    ...offerProviders,
    ...invoiceProviders,
    InvoiceService,
    UserService,
  ],
})
export class PaymentModule {}
