import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FacturationDto } from './facturation.dto';

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

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  password?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  facturation?: FacturationDto;
}
