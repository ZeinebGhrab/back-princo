import { User } from './user.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
@Schema()
export class Connector {
  @Prop()
  readonly connectorName: string;

  @Prop()
  readonly apiKey: string;
  @Prop()
  readonly webSite: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}

export const ConnectorSchema = SchemaFactory.createForClass(Connector);
