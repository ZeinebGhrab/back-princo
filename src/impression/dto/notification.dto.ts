import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NotificationDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  printerName: string;

  @IsNotEmpty()
  @IsBoolean()
  impression: boolean;

  @IsOptional()
  @IsString()
  pdfBase64?: string;
}
