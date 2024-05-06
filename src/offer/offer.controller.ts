import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OfferDto } from './dto/offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';

@Controller('offer')
@UseGuards(JwtAuthGuard)
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @Get()
  @Roles(Role.User)
  async getOffers(@Query('skip') skip: string, @Query('limit') limit: string) {
    return await this.offerService.show(skip, limit);
  }

  @Get('/admin/:id')
  @Roles(Role.Admin)
  async getOffersAdmin(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ) {
    return await this.offerService.showOfferAdmin(id, skip, limit);
  }

  @Get(':id')
  @Roles(Role.Admin)
  async readOffer(@Param('id') id: string) {
    return await this.offerService.read(id);
  }

  @Post()
  @Roles(Role.Admin)
  async createOffer(@Body() offer: OfferDto) {
    return await this.offerService.create(offer);
  }

  @Put(':id')
  @Roles(Role.Admin)
  async updateOffer(@Param('id') id: string, @Body() offer: UpdateOfferDto) {
    return await this.offerService.update(id, offer);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async deleteOffer(@Param('id') id: string) {
    return await this.offerService.delete(id);
  }
}
