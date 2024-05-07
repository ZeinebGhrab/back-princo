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
  @Transform(transformToNumber)
  readonly validityPeriod: number;

  @IsNotEmpty()
  @Transform(transformToNumber)
  readonly tva: number;

  @IsNotEmpty()
  @Transform(transformToNumber)
  readonly discount: number;

  @IsNotEmpty()
  @Transform(transformToNumber)
  readonly unitPrice: number;

  @IsNotEmpty()
  readonly admin: string;
}
