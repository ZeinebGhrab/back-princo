import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Facture } from '../auth/schemas/facture.schema';
import { CreateFactureDto } from './dto/createFacture.dto';
import { FactureDto } from './dto/facture.dto';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class FactureService {
  constructor(
    @InjectModel(Facture.name) private factureModel: Model<Facture>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async findAll(): Promise<Facture[]> {
    return await this.factureModel.find().exec();
  }

  async getUserById(id: string): Promise<Facture> {
    const facture = await this.factureModel.findById(id).exec();
    if (!facture) {
      throw new HttpException('Facture not found', HttpStatus.NOT_FOUND);
    }
    return facture;
  }

  async create(facture: CreateFactureDto, user: User): Promise<Facture> {
    const existingFactures = await this.factureModel.find({ userId: user._id });

    if (existingFactures.length > 0) {
      return this.factureModel.create({
        ...facture,
        userId: user._id,
      });
    }
    const createdFacture = await this.factureModel.create({
      ...facture,
      userId: user._id,
    });

    await this.userModel.findByIdAndUpdate(
      user._id,
      { $push: { factures: createdFacture._id } },
      { new: true },
    );

    return createdFacture;
  }

  async updateById(id: string, updateUserDto: FactureDto): Promise<Facture> {
    return this.factureModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<Facture> {
    const deletedFacture = await this.factureModel.findByIdAndDelete(id).exec();
    if (!deletedFacture) {
      throw new HttpException('Facture not found', HttpStatus.NOT_FOUND);
    }
    return deletedFacture;
  }
}
