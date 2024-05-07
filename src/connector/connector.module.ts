import { Module } from '@nestjs/common';
import { ConnectorController } from './connector.controller';
import { ConnectorService } from './connector.service';
import { DatabaseModule } from 'src/database/database.module';
import { connectorProviders } from './connector.providers';
import { userProviders } from 'src/user/user.providers';

@Module({
  imports: [DatabaseModule],
  providers: [ConnectorService, ...connectorProviders, ...userProviders],
  controllers: [ConnectorController],
})
export class ConnectorModule {}
