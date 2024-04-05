import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OfferService } from './offer.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('offer')
@UseGuards(JwtAuthGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get()
  async getOffers(@Query('skip') skip: string, @Query('limit') limit: string) {
    return await this.offerService.show(skip, limit);
  }
}
