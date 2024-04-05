import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from 'src/dto/payment.dto';
import Stripe from 'stripe';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('payment')
export class PaymentController {
  private stripe: Stripe;
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('PAYMENT_MODEL') stripeClient: Stripe,
  ) {
    this.stripe = stripeClient;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async payment(@Body() paymentDto: PaymentDto) {
    try {
      return await this.paymentService.processPayment(paymentDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  async confirmPaymentProcess(@Body() stripeEvent) {
    return await this.paymentService.confirmPayment(stripeEvent);
  }
}
