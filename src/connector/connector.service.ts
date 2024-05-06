import {
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Connector } from './schemas/connector.schema';
import { User } from 'src/user/schemas/user.schema';
import { ConnectorDto } from './dto/connector.dto';
import { PrinterDto } from './dto/printer.dto';
@Injectable()
export class ConnectorService {
  constructor(
    @Inject('CONNECTOR_MODEL')
    private readonly connectorModel: Model<Connector>,
    @Inject('USER_MODEL')
    private readonly userModel: Model<User>,
  ) {}

  async create(connectorData: ConnectorDto): Promise<Types.ObjectId> {
    const { connectorName, userId } = connectorData;
    const checkConnector = await this.connectorModel.findOne({
      connectorName,
      user: userId,
    });
    if (checkConnector) {
      throw new ConflictException('Nom du connecteur est déja existe');
    }
    const apiKey = uuidv4();
    const newConnector = new this.connectorModel({
      user: userId,
      apiKey: apiKey,
      ...connectorData,
    });
    await newConnector.save();
    await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $push: { connectors: newConnector } },
    );
    return newConnector._id;
  }

  async show(id: string, skip: string, limit: string): Promise<Connector[]> {
    const connectors = await this.connectorModel
      .find({ user: id })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    return connectors;
  }

  async getConnectorsWithPrinters(
    id: string,
    skip: string,
    limit: string,
  ): Promise<{ connectors: Connector[]; count: number }> {
    const connectors = await this.connectorModel
      .find({ user: id, printerName: { $ne: '' } })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .exec();
    const count = await this.connectorModel.countDocuments({ user: id });
    return { connectors, count };
  }

  async findById(id: string): Promise<Connector> {
    const connectorId = await this.connectorModel.findById(id);
    if (!connectorId) {
      throw new HttpException(
        "Le Connecteur n'existe pas",
        HttpStatus.NOT_FOUND,
      );
    }
    return this.connectorModel.findById(id).exec();
  }

  async update(id: string, updateConnectorDto: ConnectorDto): Promise<void> {
    const { connectorName, userId } = updateConnectorDto;
    const checkConnector = await this.connectorModel.findOne({
      connectorName,
      user: userId,
    });
    if (checkConnector) {
      throw new ConflictException('Nom du connecteur est déja existe');
    }
    await this.connectorModel
      .findByIdAndUpdate(id, updateConnectorDto, { new: true })
      .exec();
  }

  async setActive(id: string, active: { isActive: boolean }): Promise<void> {
    const connectorId = await this.connectorModel.findById(id);
    if (!connectorId) {
      throw new HttpException(
        "Le Connecteur n'existe pas",
        HttpStatus.NOT_FOUND,
      );
    }
    await this.connectorModel
      .findByIdAndUpdate(id, active, { new: true })
      .exec();
  }

  async addPrinter(id: string, updateConnector: PrinterDto): Promise<void> {
    const { apiKey, printerName } = updateConnector;
    const checkConnector = await this.connectorModel.findOne({
      apiKey,
      user: id,
    });
    if (!checkConnector) {
      throw new HttpException(
        "Le connecteur associé à cette clé API n'existe pas.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (!checkConnector.isActive) {
      throw new HttpException(
        "Vous devez d'abord activer le connecteur.",
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.connectorModel
      .findOneAndUpdate(
        { user: id, apiKey: apiKey },
        { printerName },
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(id: string): Promise<void> {
    const connector = await this.connectorModel.findByIdAndDelete(id);
    if (!connector) {
      throw new HttpException(
        "Le connecteur n'existe pas",
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
