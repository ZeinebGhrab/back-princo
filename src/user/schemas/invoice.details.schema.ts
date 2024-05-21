import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class InvoiceDetails extends Document {
  @Prop({ default: '' })
  readonly legalName: string;

  @Prop({ default: '' })
  readonly fiscalId: string;

  @Prop({ default: '' })
  readonly adress: string;

  @Prop({ default: '' })
  readonly country: string;

  @Prop({ default: '' })
  readonly city: string;

  @Prop({ default: '' })
  readonly postalCode: string;
}
export const InvoiceDetailsSchema =
  SchemaFactory.createForClass(InvoiceDetails);
