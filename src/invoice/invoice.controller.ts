import { Body, Controller, Delete, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  async getInvoices(@Body() id: string) {
    return await this.invoiceService.showInvoices(id);
  }

  @Delete(':id')
  async removeInvoice(@Param('id') id: string): Promise<void> {
    return this.invoiceService.deleteInvoice(id);
  }

  @Get('download/:invoiceNumber')
  async downloadInvoice(
    @Param('invoiceNumber') invoiceNumber: string,
    @Res() res: Response,
  ) {
    const invoiceData = await this.invoiceService.generateInvoiceData(
      invoiceNumber,
      100,
    );

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
    const pdfBuffer = await this.invoiceService.generateInvoiceData(
      invoiceNumber,
      100,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  }
}
