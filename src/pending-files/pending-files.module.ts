import { Module } from '@nestjs/common';
import { PendingFilesController } from './pending-files.controller';
import { PendingFilesService } from './pending-files.service';
import { pendingFilesProviders } from './pendilg-files.provider';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [PendingFilesController],
  providers: [...pendingFilesProviders, PendingFilesService],
})
export class PendingFilesModule {}
