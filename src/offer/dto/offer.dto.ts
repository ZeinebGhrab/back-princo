import { IsNotEmpty, IsString } from 'class-validator';

export class OfferDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  readonly ticketsNumber: number;

  @IsNotEmpty()
  readonly expirationDate: Date;

  @IsNotEmpty()
  readonly tva: number;

  @IsNotEmpty()
  readonly discount: number;

  @IsNotEmpty()
  readonly unitPrice: number;

  @IsNotEmpty()
  readonly admin: string;
}
