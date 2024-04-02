import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ejs from 'ejs';
import puppeteer from 'puppeteer';
import { Invoice } from 'src/schemas/invoice.schema';
import { Model } from 'mongoose';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject('Invoice_MODEL') private readonly invoiceModel: Model<Invoice>,
  ) {}

  async showInvoices(id: string): Promise<Invoice[]> {
    const invoices = await this.invoiceModel.find({ User: id });
    if (!invoices) {
      throw new ConflictException("L'utilisateur n'a pas encore des factures");
    }
    return invoices;
  }

  async deleteInvoice(id: string): Promise<void> {
    const removeInvoice = await this.invoiceModel
      .findByIdAndDelete({ id })
      .exec();
    if (!removeInvoice) {
      throw new ConflictException("La facture n'existe pas");
    }
  }

  async generateInvoiceData(
    invoiceNumber: string,
    amount: number,
  ): Promise<Buffer> {
    const templatePath = 'C:/Users/a/Desktop/backend/views/invoice.ejs';
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = ejs.compile(template);
    const invoiceData = {
      invoiceNumber: invoiceNumber,
      amount: amount,
      message: 'Facture',
    };
    const htmlContent = compiledTemplate(invoiceData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    return pdfBuffer;
  }

  async openInvoiceInNewTab(
    invoiceNumber: string,
    amount: number,
  ): Promise<void> {
    const templatePath = 'C:/Users/a/Desktop/backend/views/invoice.ejs';
    const template = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = ejs.compile(template);
    const invoiceData = {
      invoiceNumber: invoiceNumber,
      amount: amount,
      message: 'Facture',
    };
    const htmlContent = compiledTemplate(invoiceData);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const newPage = await browser.newPage();
    await newPage.goto(`data:text/html,${htmlContent}`, {
      waitUntil: 'domcontentloaded',
    });
    await browser.close();
  }
}
