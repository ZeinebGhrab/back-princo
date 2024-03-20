import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';
export class CreateFactureDto {
  @IsString()
  @IsNotEmpty()
  readonly code: string;

  @IsString()
  @IsNotEmpty()
  readonly raisonSociale: string;

  @IsString()
  @IsNotEmpty()
  readonly matriculeFisacle: string;

  @IsString()
  @IsNotEmpty()
  readonly adresse: string;

  @IsString()
  @IsNotEmpty()
  readonly pays: string;

  @IsString()
  @IsNotEmpty()
  readonly ville: string;

  @IsString()
  @IsNotEmpty()
  readonly codePostale: string;

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly userId: string;
}
