import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import { Connector } from 'src/schemas/connector.schema';
import { CreateConnectorDto } from 'src/dto/connector.dto';
import { UpdateConnectorDto } from 'src/dto/update-connector.dto';

@Injectable()
export class ConnectorService {
  constructor(
    @Inject('CONNECTOR_MODEL')
    private readonly connectorModel: Model<Connector>,
    @Inject('USER_MODEL')
    private readonly userModel: Model<User>,
  ) {}
  async create(
    connectorData: CreateConnectorDto,
    user: User,
  ): Promise<Connector> {
    const { connectorName } = connectorData;
    const checkConnector = await this.connectorModel.findOne({
      connectorName,
    });
    if (checkConnector) {
      throw new ConflictException("Nom d'imprimante est déja existe");
    }
    //generate api_key for the printer (uuidv4())
    const apiKey = uuidv4();
    const newConnector = new this.connectorModel({
      user: user,
      apiKey: apiKey,
      ...connectorData,
    });
    await newConnector.save();
    await this.userModel.findOneAndUpdate(
      { _id: user._id },
      { $push: { connectors: newConnector } },
    );
    return newConnector;
  }
  async show(id: string): Promise<Connector[]> {
    const connectors = await this.connectorModel.find({ user: id }).exec();
    return connectors;
  }
  async findById(id: string): Promise<Connector> {
    const connectorId = await this.connectorModel.findById(id);
    if (!connectorId) {
      throw new ConflictException("imprimante n'est pas existe");
    }
    return this.connectorModel.findById(id).exec();
  }
  async update(
    id: string,
    updateConnectorDto: UpdateConnectorDto,
  ): Promise<Connector> {
    return this.connectorModel
      .findByIdAndUpdate(id, updateConnectorDto, { new: true })
      .exec();
  }
  async remove(id: string): Promise<Connector> {
    const connector = await this.connectorModel.findByIdAndDelete(id);
    if (!connector) {
      throw new ConflictException("L'imprimante n'existe pas");
    }
    await this.userModel.updateMany(
      { connectors: connector._id },
      { $pull: { connectors: connector._id } },
    );
    return connector;
  }
}
