import { IsString, IsNotEmpty } from 'class-validator';

export class ImpressionDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  pdfBase64: string;
}
