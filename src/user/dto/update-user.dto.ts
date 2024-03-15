import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoleName } from '../../auth/schemas/role.schema';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

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
  Url?: string;

  @IsOptional()
  @IsEnum(RoleName)
  @IsNotEmpty()
  role: RoleName;
}
