import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';

@Controller('invoice')
@UseGuards(JwtAuthGuard)
@Roles(Role.User)
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
}
