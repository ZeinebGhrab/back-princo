import { IsNotEmpty, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsNotEmpty()
  readonly offerId: string;
}
