import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Offer } from 'src/offer/schemas/offer.schema';
import { User } from 'src/user/schemas/user.schema';

@Schema({ timestamps: true })
export class Payment {
  @Prop()
  readonly amount: number;

  @Prop({ type: Date, default: () => new Date() })
  readonly paymentDate: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' })
  readonly offer: Offer;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
