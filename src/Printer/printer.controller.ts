import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PrinterService } from './printer.service';
import { UpdatePrinterDto } from './dto/update.dto';
import { CreatePrinterDto } from './dto/printer.dto';
import { Printer } from './schemas/printer.schema';
import { AuthGuard } from '@nestjs/passport';
@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}
  @Post()
  @UseGuards(AuthGuard())
  async create(
    @Body() printerData: CreatePrinterDto,
    @Req() req,
  ): Promise<{ printer: Printer }> {
    // Ensure the correct user is passed to the create method
    const userId = req.user.id; // Extract user ID from the request
    const printer = await this.printerService.create(printerData, userId);
    return { printer };
  }

  @Get()
  findAll(): Promise<Printer[]> {
    return this.printerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Printer> {
    return this.printerService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePrinterDto: UpdatePrinterDto,
  ): Promise<Printer> {
    return this.printerService.update(id, updatePrinterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<any> {
    return this.printerService.remove(id);
  }
}
