import { Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { PendingFilesService } from './pending-files.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('pending-files')
@UseGuards(JwtAuthGuard)
@Roles(Role.User)
export class PendingFilesController {
  constructor(private readonly pendingFilesService: PendingFilesService) {}
  @Get(':id')
  async getImpressions(
    @Param('id') id: string,
    @Query('skip') skip: string,
    @Query('limit') limit: string,
  ) {
    try {
      return await this.pendingFilesService.getPendingFiles(id, skip, limit);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  async setIsPrintedPendingFile(@Param('id') id: string) {
    await this.pendingFilesService.setIsPrinted(id);
  }

  @Cron(CronExpression.EVERY_6_MONTHS)
  async deletePendingFilesIsPrinted() {
    await this.pendingFilesService.deletePendingFiles();
  }
}
