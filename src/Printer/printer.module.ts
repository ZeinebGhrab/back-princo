import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PrinterSchema } from './Schemas/printer.schema';
import { PrinterController } from './printer.controller';
import { PrinterService } from './printer.service';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Printer', schema: PrinterSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PrinterController],
  providers: [PrinterService],
})
export class PrinterModule {}
