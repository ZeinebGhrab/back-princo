import { Connection } from 'mongoose';
import { OfferSchema } from 'src/schemas/offer.schema';

export const offerProviders = [
  {
    provide: 'OFFER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Offer', OfferSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];