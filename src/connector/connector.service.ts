import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User } from '../schemas/user.schema/user.schema';
import { v4 as uuidv4 } from 'uuid';
import { Connector } from 'src/schemas/connector.schema';
import { ConnectorDto } from 'src/dto/connector.dto';

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

  async findById(id: string): Promise<Connector> {
    const connectorId = await this.connectorModel.findById(id);
    if (!connectorId) {
      throw new ConflictException("Le Connecteur n'existe pas");
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

  async remove(id: string): Promise<void> {
    const connector = await this.connectorModel.findByIdAndDelete(id);
    if (!connector) {
      throw new ConflictException("Le connecteur n'existe pas");
    }
    await this.userModel.updateMany(
      { connectors: connector._id },
      { $pull: { connectors: connector._id } },
    );
  }
}
