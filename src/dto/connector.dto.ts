import { IsEmpty, IsNotEmpty, IsString } from 'class-validator';

export class CreateConnectorDto {
  @IsNotEmpty()
  @IsString()
  readonly connectorName: string;

  @IsEmpty({ message: 'You cannot pass user id' })
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly webSite: string;
}
