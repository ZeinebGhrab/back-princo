import { Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';
import { Invoice } from 'src/invoice/schemas/invoice.schema';
import { Model } from 'mongoose';
import { InvoiceDto } from 'src/invoice/dto/invoice.dto';
import * as moment from 'moment';
import 'moment/locale/fr';
import { Offer } from 'src/offer/schemas/offer.schema';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('INVOICE_MODEL') private readonly invoiceModel: Model<Invoice>,
    @Inject('OFFER_MODEL') private readonly offerModel: Model<Offer>,
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
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
    return invoices;
  }

  async createInvoice(invoice: InvoiceDto): Promise<void> {
    const numberOfInvoices = await this.invoiceModel
      .find({ user: invoice.user })
      .countDocuments();
    const currentYearLastTwoDigits = new Date()
      .getFullYear()
      .toString()
      .slice(-2);
    const ref = `${numberOfInvoices + 1}/${currentYearLastTwoDigits}`;

    const offer = await this.offerModel.findById(invoice.offerId);
    const user = await this.userModel.findById(invoice.user);

    const templatePath = 'views/invoice.ejs';
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = ejs.compile(template);

    const invoiceData = {
      ref,
      offer,
      user,
      logoPath: `${process.env.SERVER_URL}/images/princo.png`,
      stylePath: `${process.env.SERVER_URL}/styles/invoice.css`,
      paymentDate: moment(new Date()).format('DD MMMM YYYY'),
      amountTTC: offer.unitPrice * (1 + offer.tva),
      amountTVA: (offer.unitPrice * offer.tva) / 100,
      amount: invoice.amount,
      offerPriceHT: offer.unitPrice * (1 - offer.discount / 100),
    };
    const htmlContent = compiledTemplate(invoiceData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const directoryPath = './uploads/invoices';
    const invoicePath = path.join(directoryPath, `${uuidv4()}.pdf`);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
    fs.writeFileSync(invoicePath, pdfBuffer);

    await this.invoiceModel.create({
      amount: invoice.amount,
      premiumPack: offer.title,
      ref,
      invoicePath,
      user: invoice.user,
    });
  }
}
