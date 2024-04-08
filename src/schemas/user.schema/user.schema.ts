import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InvoiceDetails } from './invoice.details.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  readonly firstName: string;

  @Prop({ required: true })
  readonly lastName: string;

  @Prop({ required: true })
  readonly email: string;

  @Prop({ required: true })
  readonly password: string;

  @Prop()
  readonly gender: string;

  @Prop()
  readonly birthDate: string;

  @Prop()
  readonly tel: string;

  @Prop()
  readonly country: string;

  @Prop()
  readonly profile: string;

  @Prop({ default: '' })
  emailVerificationToken: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: false })
  resetPassword: boolean;

  @Prop({ type: InvoiceDetails })
  readonly invoiceDetails: InvoiceDetails;

  @Prop({ default: 0 })
  readonly tickets: number;

  @Prop({ type: Date, default: () => new Date() })
  readonly ticketsExpirationDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);