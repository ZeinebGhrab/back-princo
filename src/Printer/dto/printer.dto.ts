import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePrinterDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly userId: string; // Change the property name to userId
  @IsOptional()
  @IsString()
  url: string;
}
