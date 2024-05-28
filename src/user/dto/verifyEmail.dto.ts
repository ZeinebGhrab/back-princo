import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class verifyEmailDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsOptional()
  @IsEmail()
  newEmail: string;
}
