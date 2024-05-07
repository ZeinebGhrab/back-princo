import { Connection } from 'mongoose';
import { PaymentSchema } from 'src/payment/schemas/payment.schema';
import Stripe from 'stripe';

export const stripeProviders = [
  {
    provide: 'STRIPE_MODEL',
    useFactory: () => {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });
      return stripe;
    },
    inject: ['DATABASE_CONNECTION'],
  },
];

export const paymentProviders = [
  {
    provide: 'PAYMENT_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Payment', PaymentSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
