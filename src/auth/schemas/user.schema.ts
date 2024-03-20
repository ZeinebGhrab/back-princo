import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Facture } from './facture.schema';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  readonly firstName: string;
  @Prop()
  readonly lastName: string;
  @Prop({ required: true })
  readonly email: string;
  @Prop()
  emailVerificationToken: string;
  @Prop()
  emailVerified: boolean;
  @Prop()
  tél: string;
  @Prop()
  readonly password: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facture' }] })
  readonly factures: Facture[];
}

export const UserSchema = SchemaFactory.createForClass(User);
