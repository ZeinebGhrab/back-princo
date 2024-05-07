import { IsString, IsNotEmpty } from 'class-validator';

export class IntegrationDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  pdf: string;
}
