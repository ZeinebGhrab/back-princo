import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Connector } from 'src/connector/schemas/connector.schema';
import { User } from 'src/user/schemas/user.schema';
@Schema({ timestamps: true })
export class PendingFiles {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  readonly user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Connector' })
  readonly connector: Connector;

  @Prop()
  readonly pdfBase64: string;

  @Prop({ default: false })
  readonly isPrinted: boolean;
}
export const PendingFilesSchema = SchemaFactory.createForClass(PendingFiles);
