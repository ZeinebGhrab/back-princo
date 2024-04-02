import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
@Schema()
export class Invoice {
  @Prop()
  readonly invoiceNumber: string;

  @Prop()
  readonly amount: number;
  @Prop()
  readonly date: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
