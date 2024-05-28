import { IsNotEmpty, IsString } from 'class-validator';

export class InvoiceDto {
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  readonly offerId: string;

  @IsString()
  readonly user: string;
}
