import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { ObjectId } from 'typeorm';

@Schema()
export class Facture extends Document {
  @Prop()
  readonly code: string;
  @Prop()
  readonly codePostale: string;
  @Prop()
  readonly pays: string;
  @Prop()
  readonly ville: string;
  @Prop()
  readonly raisonSociale: string;
  @Prop()
  readonly matriculeFisacle: string;
  readonly adresse: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
}
export const FactureSchema = SchemaFactory.createForClass(Facture);
