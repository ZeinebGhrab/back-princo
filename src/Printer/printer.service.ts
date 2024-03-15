import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Printer } from './schemas/printer.schema';
import { UpdatePrinterDto } from './dto/update.dto';
import { CreatePrinterDto } from './dto/printer.dto';
import { User } from '../auth/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

@Injectable()
export class PrinterService {
  constructor(
    @InjectModel(Printer.name)
    private printerModel: mongoose.Model<Printer>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(printerData: CreatePrinterDto, user: User): Promise<Printer> {
    const existingPrinter = await this.printerModel.findOne({
      name: printerData.name,
    });
    if (existingPrinter) {
      throw new ConflictException('Printer item already exists');
    }
    const apiKey = uuidv4(); // Generate API key
    const newPrinter = new this.printerModel({
      user: user,
      apiKey: apiKey,
      ...printerData,
    });
    return newPrinter.save();
  }

  async findAll(): Promise<Printer[]> {
    return this.printerModel.find().exec();
  }

  async findOne(id: string): Promise<Printer> {
    return this.printerModel.findById(id).exec();
  }

  async update(
    id: string,
    updatePrinterDto: UpdatePrinterDto,
  ): Promise<Printer> {
    return this.printerModel
      .findByIdAndUpdate(id, updatePrinterDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<any> {
    return this.printerModel.findByIdAndDelete(id).exec();
  }
}
