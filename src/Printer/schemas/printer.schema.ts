import { User } from '../../auth/schemas/user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose'; // Import SchemaFactory from Mongoose

@Schema()
export class Printer {
  @Prop()
  name: string;

  @Prop()
  apiKey: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;
  @Prop()
  url: string;
}

export const PrinterSchema = SchemaFactory.createForClass(Printer);
