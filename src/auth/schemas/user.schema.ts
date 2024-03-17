import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Facturation, FacturationSchema } from './facturation.schema';

// Update the import

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop({ unique: true })
  email: string;
  @Prop()
  password: string;
  @Prop({ type: FacturationSchema })
  facturation: Facturation;
}

export const UserSchema = SchemaFactory.createForClass(User);
