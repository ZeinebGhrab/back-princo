import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ConnectorService } from './connector.service';
import { ConnectorDto } from 'src/connector/dto/connector.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Types } from 'mongoose';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';
import { Connector } from './schemas/connector.schema';
import { PrinterDto } from './dto/printer.dto';

@Controller('connector')
@UseGuards(JwtAuthGuard)
@Roles(Role.User)
export class ConnectorController {
  constructor(private readonly connectorService: ConnectorService) {}
  @Post()
  async create(@Body() connectorData: ConnectorDto): Promise<Types.ObjectId> {
    const connector = await this.connectorService.create(connectorData);
    return connector;
  }
  @Get('connectors/:id')
  findAll(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ): Promise<Connector[]> {
    return this.connectorService.show(id, skip, limit);
  }
  @Get('connectors/:id/printers')
  getConnectorsWithPrinters(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ): Promise<{ connectors: Connector[]; count: number }> {
    return this.connectorService.getConnectorsWithPrinters(id, skip, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Connector> {
    return this.connectorService.findById(id);
  }
  @Put(':id/printers')
  updateConnectorsWithPrinters(
    @Param('id') id: string,
    @Body() updateConnectorDto: PrinterDto,
  ): Promise<void> {
    return this.connectorService.addPrinter(id, updateConnectorDto);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateConnectorDto: ConnectorDto,
  ): Promise<void> {
    return this.connectorService.update(id, updateConnectorDto);
  }
  @Put('isActive/:id')
  async updateIsActive(
    @Param('id') id: string,
    @Body() active: { isActive: boolean },
  ): Promise<void> {
    return await this.connectorService.setActive(id, active);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.connectorService.remove(id);
  }
}
