import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('invoice')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get(':id')
  async getInvoices(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ) {
    return await this.invoiceService.showInvoices(id, skip, limit);
  }

  @Get('download/:id')
  async downloadInvoice(
    @Param('id') invoiceNumber: string,
    @Res() res: Response,
  ) {
    const invoiceData =
      await this.invoiceService.generateInvoice(invoiceNumber);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${invoiceNumber}.pdf`,
    );
    res.send(invoiceData);
  }
  @Get('open/:invoiceNumber')
  async openInvoice(
    @Param('invoiceNumber') invoiceNumber: string,
    @Res() res: Response,
  ): Promise<void> {
    const invoiceData =
      await this.invoiceService.generateInvoice(invoiceNumber);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(invoiceData);
  }
}
