import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConnectorService } from './connector.service';
import { Connector } from 'src/schemas/connector.schema';
import { CreateConnectorDto } from 'src/dto/connector.dto';
import { UpdateConnectorDto } from 'src/dto/update-connector.dto';
@Controller('connector')
export class ConnectorController {
  private logger = new Logger('ConnectorController');
  constructor(private readonly connectorService: ConnectorService) {}
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @Body() connectorData: CreateConnectorDto,
    @Req() req,
  ): Promise<{ connector: Connector }> {
    const userId = req.user._id;
    this.logger.log(userId);
    const connector = await this.connectorService.create(connectorData, userId);
    this.logger.log(connector);
    return { connector };
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
    @Body() updateConnectorDto: UpdateConnectorDto,
  ): Promise<Connector> {
    this.logger.log(JSON.stringify(updateConnectorDto));
    return this.connectorService.update(id, updateConnectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.connectorService.remove(id);
  }
}
