import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsNumber()
  readonly ticketsNumber: number;

  @IsNumber()
  readonly validityPeriod: number;

  @IsNumber()
  readonly tva: number;

  @IsNumber()
  readonly discount: number;

  @IsNumber()
  readonly unitPrice: number;

  @IsNotEmpty()
  @IsString()
  readonly admin: string;
}