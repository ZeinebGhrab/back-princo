import { IsString } from 'class-validator';
export class InvoiceDetailsDto {
  @IsString()
  readonly legalName: string;

  @IsString()
  readonly fiscalId: string;

  @IsString()
  readonly adress: string;

  @IsString()
  readonly country: string;

  @IsString()
  readonly city: string;

  @IsString()
  readonly postalCode: string;
}
