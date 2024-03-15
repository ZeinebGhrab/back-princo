import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePrinterDto {
  @IsOptional()
  @IsString()
  readonly name?: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  Url?: string;
}
