import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Offer } from './offer.schema';
import { User } from './user.schema';

@Schema()
export class Payment {
  @Prop({ type: Date, default: () => new Date() })
  readonly paymentDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' })
  readonly offer: Offer;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
