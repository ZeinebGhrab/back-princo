import { Module } from '@nestjs/common';
import { ConnectorController } from './connector.controller';
import { ConnectorService } from './connector.service';
import { Connector, ConnectorSchema } from 'src/schemas/connector.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Connector.name, schema: ConnectorSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ConnectorController],
  providers: [ConnectorService],
})
export class ConnectorModule {}
