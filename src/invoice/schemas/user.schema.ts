import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class UserInvoice extends Document {
  @Prop()
  readonly _id: string;
  @Prop()
  readonly firstName: string;

  @Prop()
  readonly lastName: string;

  @Prop()
  readonly email: string;

  @Prop({ default: '' })
  readonly invoiceAddress: string;

  @Prop({ default: '' })
  readonly invoiceCity: string;

  @Prop({ default: '' })
  readonly invoiceCountry: string;
}
export const InvoiceDetailsSchema = SchemaFactory.createForClass(UserInvoice);
