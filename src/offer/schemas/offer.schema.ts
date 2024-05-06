import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/user/schemas/user.schema';
import mongoose from 'mongoose';
@Schema()
export class Offer {
  @Prop()
  readonly title: string;

  @Prop()
  readonly description: string;

  @Prop()
  readonly ticketsNumber: number;

  @Prop()
  readonly validityPeriod: number;

  @Prop()
  tva: number;

  @Prop()
  discount: number;

  @Prop()
  unitPrice: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly admin: User;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);