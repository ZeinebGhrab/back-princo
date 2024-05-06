import { IsNotEmpty, IsString } from 'class-validator';

export class PrinterDto {
  @IsNotEmpty()
  @IsString()
  readonly apiKey: string;

  @IsString()
  readonly printerName: string;
}
