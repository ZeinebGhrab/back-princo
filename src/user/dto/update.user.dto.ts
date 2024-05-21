import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { InvoiceDetailsDto } from './invoiceDetails.dto';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  emailVerificationToken?: string;

  @IsOptional()
  @IsBoolean()
  resetEmail: boolean;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  tel?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsOptional()
  invoiceDetails?: InvoiceDetailsDto;
}
