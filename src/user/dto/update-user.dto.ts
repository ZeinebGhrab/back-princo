import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FactureDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  raisonSociale?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  matriculeFisacle?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  adresse?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  pays?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  ville?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  codePostale?: string;
}

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FactureDto)
  factures?: FactureDto[];
}
