import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Facture extends Document {
  @Prop()
  codePostale: string;
  @Prop()
  pays: string;
  @Prop()
  ville: string;
  @Prop()
  raisonSociale: string;
  @Prop()
  matriculeFisacle: string;
  @Prop()
  adresse: string;
}

export const FactureSchema = SchemaFactory.createForClass(Facture);
