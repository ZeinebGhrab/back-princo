import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Offer } from './offer.schema';
@Schema()
export class Invoice {
  @Prop()
  readonly ref: string;

  @Prop()
  readonly premiumPack: string;

  @Prop()
  readonly amount: number;

  @Prop({ type: Date, default: () => new Date() })
  readonly paymentDate: string;

  @Prop()
  readonly expirationDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' })
  readonly offer: Offer;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
