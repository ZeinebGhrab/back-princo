import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { CreateFactureDto } from './dto/createFacture.dto';
import { FactureDto } from './dto/facture.dto';
import { AuthGuard } from '@nestjs/passport';
import { Facture } from '../auth/schemas/facture.schema';
import { FactureService } from './facture.service';
import { Request } from 'express'; // Import Request from express
import { User } from '../auth/schemas/user.schema'; // Import User model

@Controller('factures')
export class FactureController {
  constructor(private factureService: FactureService) {}

  @Get()
  async getAllFoods(): Promise<Facture[]> {
    return this.factureService.findAll();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<Facture> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.factureService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() body: CreateFactureDto,
    @Req() req,
  ): Promise<{ facture: Facture }> {
    const userId = req.user._id;
    const facture = await this.factureService.create(body, userId);
    return { facture };
  }

  @Put(':id')
  async updateFacture(
    @Param('id') id: string,
    @Body() facture: FactureDto,
  ): Promise<Facture> {
    return this.factureService.updateById(id, facture);
  }

  @Delete(':id')
  async deleteFacture(@Param('id') id: string): Promise<Facture> {
    return this.factureService.deleteById(id);
  }
}
