import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { InvoiceDetails } from './invoice.details.schema';
import { Role } from 'src/role/enums/role.enum';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  readonly firstName: string;

  @Prop({ required: true })
  readonly lastName: string;

  @Prop({ required: true, unique: true })
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

  @Prop()
  readonly profileImage: string;

  @Prop({ default: '' })
  emailVerificationToken: string;

  @Prop({ default: false })
  readonly emailVerified: boolean;

  @Prop({ default: false })
  readonly resetEmail: boolean;

  @Prop({ default: false })
  readonly resetPassword: boolean;

  @Prop({ type: InvoiceDetails })
  readonly invoiceDetails: InvoiceDetails;

  @Prop({ default: 0 })
  tickets: number;

  @Prop({ type: Date, default: () => new Date() })
  readonly ticketsExpirationDate: Date;

  @Prop({ default: Role.User })
  readonly roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
