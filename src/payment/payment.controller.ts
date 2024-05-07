import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from 'src/payment/dto/payment.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
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
