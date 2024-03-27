import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateConnectorDto {
  @IsOptional()
  @IsString()
  readonly connectorName?: string;
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  webSite?: string;
}
