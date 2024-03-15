import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RoleName } from '../../auth/schemas/role.schema';
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(RoleName)
  @IsNotEmpty()
  role: RoleName;
}
