import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PaymentDto } from 'src/payment/dto/payment.dto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { Offer } from 'src/offer/schemas/offer.schema';
import { Payment } from 'src/payment/schemas/payment.schema';
import { User } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    @Inject('OFFER_MODEL') private readonly offerModel: Model<Offer>,
    @Inject('PAYMENT_MODEL') private readonly paymentModel: Model<Payment>,
    @Inject('STRIPE_MODEL') stripeClient: Stripe,
    private readonly invoiceService: InvoiceService,
    private readonly userService: UserService,
  ) {
    this.stripe = stripeClient;
  }

  async processPayment(payment: PaymentDto) {
    try {
      const user = await this.userModel.findById(payment.userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      const offer = await this.offerModel.findById(payment.offerId);
      if (!offer) {
        throw new Error('Offre non trouvée');
      }

      const totalPrice =
        offer.unitPrice + offer.unitPrice * (offer.tva / 100) - offer.discount;

      const line_items = [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: offer.title,
              description: offer.description,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ];

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,
        success_url: `${process.env.URL}/successfulPayment`,
        cancel_url: `${process.env.URL}/failedPayment`,
        metadata: {
          userId: payment.userId,
          offerId: payment.offerId,
          totalPrice: totalPrice,
          tickets: offer.ticketsNumber,
          expirationDate: offer.expirationDate.toISOString(),
        },
      });
      return session;
    } catch (error) {
      throw new Error(`Échec du traitement du paiement : ${error.message}`);
    }
  }

  async createPayment(payment: PaymentDto) {
    try {
      await this.paymentModel.create({
        user: payment.userId,
        offer: payment.offerId,
        amount: payment.amount,
      });
    } catch (error) {
      throw error(`erreur d'ajout de paiement ${error}`);
    }
  }

  async confirmPayment(stripeEvent: any) {
    const endpointSecret = process.env.END_POINT_SECRET;
    try {
      const testHeader = Stripe.webhooks.generateTestHeaderString({
        payload: JSON.stringify(stripeEvent),
        secret: endpointSecret,
      });
      const event = await this.stripe.webhooks.constructEvent(
        JSON.stringify(stripeEvent),
        testHeader,
        endpointSecret,
      );

      if (event.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object;
        const metadata = session.metadata;

        await this.createPayment({
          userId: metadata.userId,
          offerId: metadata.offerId,
          amount: metadata.totalPrice,
        });

        await this.userService.updateTicketsUser({
          userId: metadata.userId,
          expirationDate: metadata.expirationDate,
          tickets: metadata.tickets,
        });

        await this.invoiceService.createInvoice({
          user: metadata.userId,
          offerId: metadata.offerId,
          amount: metadata.totalPrice,
        });
      }
      return { received: true };
    } catch (error) {
      throw new Error(`Erreur lors du traitement : ${error}`);
    }
  }
}
