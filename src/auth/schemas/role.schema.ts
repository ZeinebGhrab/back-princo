import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;
export enum RoleName {
  admin = 'Admin',
  employee = 'Employee',
  client = 'Client',
}

@Schema()
export class Role {
  @Prop({ required: true, type: String, enum: RoleName })
  role: RoleName;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
