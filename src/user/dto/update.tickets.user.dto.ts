import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTickets {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  tickets: string;

  @IsNotEmpty()
  expirationDate: Date;
}
