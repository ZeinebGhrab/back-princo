import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
@Schema({ timestamps: true })
export class Invoice {
  @Prop()
  readonly ref: string;

  @Prop()
  readonly premiumPack: string;

  @Prop()
  readonly invoicePath: string;

  @Prop()
  readonly amount: number;

  @Prop({ type: Date, default: () => new Date() })
  readonly paymentDate: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}
export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
