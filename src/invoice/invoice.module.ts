import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { invoiceProviders } from './invoice.provider';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService, ...invoiceProviders],
})
export class InvoiceModule {}
