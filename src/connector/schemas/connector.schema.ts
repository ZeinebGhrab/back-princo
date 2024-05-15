import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schemas/user.schema';
@Schema()
export class Connector {
  @Prop({ timestamps: true })
  readonly connectorName: string;

  @Prop()
  readonly apiKey: string;

  @Prop()
  readonly webSite: string;

  @Prop({ default: '' })
  readonly printerName: string;

  @Prop({ default: true })
  readonly isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;
}

export const ConnectorSchema = SchemaFactory.createForClass(Connector);
