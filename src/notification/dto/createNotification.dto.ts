import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsString()
  connector: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  user: string;
}
