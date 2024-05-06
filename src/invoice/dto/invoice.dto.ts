import { IsNotEmpty, IsString } from 'class-validator';

export class InvoiceDto {
  @IsNotEmpty()
  readonly amount: number;

  @IsNotEmpty()
  readonly validity: number;

  @IsString()
  readonly offerId: string;

  @IsString()
  readonly user: string;
}
