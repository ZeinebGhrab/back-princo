import { IsNotEmpty, IsString } from 'class-validator';

export class InvoiceDto {
  @IsNotEmpty()
  readonly amount: number;

  @IsNotEmpty()
  readonly validity: number;

  @IsString()
  readonly offer: string;

  @IsString()
  readonly user: string;

  @IsString()
  readonly premiumPack: string;
}
