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
  readonly expirationDate: Date;

  @Prop()
  readonly tva: number;

  @Prop()
  readonly discount: number;

  @Prop()
  readonly unitPrice: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly admin: User;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
