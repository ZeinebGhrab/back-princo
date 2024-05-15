import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Offer } from 'src/offer/schemas/offer.schema';
import { OfferDto } from './dto/offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OfferService {
  constructor(
    @Inject('OFFER_MODEL') private readonly offerModel: Model<Offer>,
  ) {}

  async show(skip: string, limit: string) {
    const offers = await this.offerModel
      .find()
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    return offers;
  }

  async showOfferAdmin(id: string, skip: string, limit: string) {
    const offers = await this.offerModel
      .find({ admin: id })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    return offers;
  }

  async create(offer: OfferDto): Promise<void> {
    try {
      await this.offerModel.create(offer);
    } catch (error) {
      throw error;
    }
  }

  async read(id: string): Promise<Offer> {
    try {
      const offer = await this.offerModel.findOne({ _id: id });
      if (!offer) {
        throw new UnauthorizedException(
          "L'offre n'existe pas pour cette administrateur",
        );
      } else {
        return offer;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, offer: UpdateOfferDto): Promise<void> {
    try {
      const checkAdmin = await this.offerModel.find({
        _id: id,
        admin: offer.admin,
      });
      if (!checkAdmin) {
        throw new UnauthorizedException(
          "L'offre n'existe pas pour cette administrateur",
        );
      } else {
        await this.offerModel.findByIdAndUpdate(id, offer, { new: true });
      }
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.offerModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}
