import { IsEmail, IsOptional } from 'class-validator';

export class forgetPasswordDto {
  @IsOptional()
  @IsEmail()
  email: string;
}
