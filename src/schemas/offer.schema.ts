import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
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
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
