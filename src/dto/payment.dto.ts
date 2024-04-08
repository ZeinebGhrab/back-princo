import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PaymentDto {
  @IsString()
  @IsNotEmpty()
  readonly userId: string;

  @IsNotEmpty()
  readonly offerId: string;

  @IsOptional()
  readonly amount: number;
}
