import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Offer } from 'src/schemas/offer.schema';

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
}
