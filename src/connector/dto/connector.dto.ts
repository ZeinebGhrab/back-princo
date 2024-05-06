import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectorDto {
  @IsNotEmpty()
  @IsString()
  readonly connectorName: string;

  @IsNotEmpty()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly webSite: string;
}
