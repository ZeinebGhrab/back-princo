import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { Connector } from 'src/schemas/connector.schema';
import { ConnectorDto } from 'src/dto/connector.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('connector')
@UseGuards(JwtAuthGuard)
export class ConnectorController {
  private logger = new Logger('ConnectorController');
  constructor(private readonly connectorService: ConnectorService) {}
  @Post()
  async create(@Body() connectorData: ConnectorDto): Promise<Types.ObjectId> {
    const connector = await this.connectorService.create(connectorData);
    this.logger.log(connector);
    return connector;
  }
  @Get('connectors/:id')
  findAll(@Param('id') id: string): Promise<Connector[]> {
    return this.connectorService.show(id);
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Connector> {
    return this.connectorService.findById(id);
  }
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateConnectorDto: ConnectorDto,
  ): Promise<void> {
    this.logger.log(JSON.stringify(updateConnectorDto));
    return this.connectorService.update(id, updateConnectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.connectorService.remove(id);
  }
}
