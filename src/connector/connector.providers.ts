import { Connection } from 'mongoose';
import { ConnectorSchema } from './schemas/connector.schema';

export const connectorProviders = [
  {
    provide: 'CONNECTOR_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Connector', ConnectorSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
