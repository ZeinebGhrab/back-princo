import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class InvoiceDetails extends Document {
  @Prop()
  readonly legalName: string;

  @Prop()
  readonly fiscalId: string;

  @Prop()
  readonly adress: string;

  @Prop()
  readonly country: string;

  @Prop()
  readonly city: string;

  @Prop()
  readonly postalCode: string;
}
export const InvoiceDetailsSchema =
  SchemaFactory.createForClass(InvoiceDetails);
