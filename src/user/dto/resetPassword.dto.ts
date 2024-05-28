import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class resetPasswordDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
