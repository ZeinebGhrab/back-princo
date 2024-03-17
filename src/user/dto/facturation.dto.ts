import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FacturationDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  RaisonSociale?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  MatriculeFisacle?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  Adresse?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  Pays?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  Ville?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  CodePostale?: string;
}
