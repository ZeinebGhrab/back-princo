import { Module } from '@nestjs/common';
import { FactureController } from './facture.controller';
import { FactureService } from './facture.service';
import { Facture, FactureSchema } from '../auth/schemas/facture.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Facture.name, schema: FactureSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [FactureController],
  providers: [FactureService],
})
export class FactureModule {}
