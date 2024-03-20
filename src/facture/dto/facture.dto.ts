import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class FactureDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  raisonSociale?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  matriculeFisacle?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adresse?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pays?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ville?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  codePostale?: string;
}
