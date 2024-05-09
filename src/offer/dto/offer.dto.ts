import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

function transformToNumber(value: any): number {
  return Number(value);
}

export class OfferDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @IsNotEmpty()
  @Transform(transformToNumber)
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
