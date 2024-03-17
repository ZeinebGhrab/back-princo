// facturation.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Facturation extends Document {
  @Prop()
  RaisonSociale: string;

  @Prop()
  MatriculeFisacle: string;

  @Prop()
  Adresse: string;

  @Prop()
  Pays: string;

  @Prop()
  Ville: string;

  @Prop()
  CodePostale: string;

}

export const FacturationSchema = SchemaFactory.createForClass(Facturation);
