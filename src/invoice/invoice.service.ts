import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';
import { Invoice } from 'src/schemas/invoice.schema';
import { Model } from 'mongoose';
import { InvoiceDto } from 'src/dto/invoice.dto';
import * as moment from 'moment';
import 'moment/locale/fr';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('INVOICE_MODEL') private readonly invoiceModel: Model<Invoice>,
  ) {}

  async showInvoices(
    id: string,
    skip: string,
    limit: string,
  ): Promise<Invoice[]> {
    const invoices = await this.invoiceModel
      .find({ user: id })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    if (!invoices) {
      throw new ConflictException("L'utilisateur n'a pas encore des factures");
    }
    return invoices;
  }

  async createInvoice(invoice: InvoiceDto): Promise<void> {
    const today = new Date();
    const expirationDate = new Date(
      today.getTime() + invoice.validity * 24 * 60 * 60 * 1000,
    );
    const numberOfInvoices = await this.invoiceModel
      .find({ user: invoice.user })
      .countDocuments();
    const currentYearLastTwoDigits = new Date()
      .getFullYear()
      .toString()
      .slice(-2);
    const ref = `${numberOfInvoices + 1}/${currentYearLastTwoDigits}`;

    await this.invoiceModel.create({ ...invoice, expirationDate, ref });
  }

  async generateInvoice(id: string): Promise<Buffer> {
    const templatePath = 'C:/Users/a/Desktop/backend/views/invoice.ejs';
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = ejs.compile(template);
    const invoice = await this.invoiceModel
      .findById(id)
      .populate('user')
      .populate('offer');

    const invoiceData = {
      ref: invoice.ref,
      offer: invoice.offer,
      user: invoice.user,
      paymentDate: moment(invoice.paymentDate).format('DD MMMM YYYY'),
      expirationDate: moment(invoice.expirationDate).format('DD MMMM YYYY'),
      amountTTC: invoice.offer.unitPrice * (1 + invoice.offer.tva),
      amountTVA: (invoice.offer.unitPrice * invoice.offer.tva) / 100,
      amount: invoice.amount,
      offerPriceHT:
        invoice.offer.unitPrice * (1 - invoice.offer.discount / 100),
    };
    const htmlContent = compiledTemplate(invoiceData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
  }
}
