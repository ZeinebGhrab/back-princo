import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Connector } from 'src/connector/schemas/connector.schema';
import { User } from 'src/user/schemas/user.schema';
@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  readonly message: string;

  @Prop({ required: true })
  readonly status: string;

  @Prop({ required: true })
  readonly date: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  readonly user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Connector' })
  readonly connector: Connector;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
