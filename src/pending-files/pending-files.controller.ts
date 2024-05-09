import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PendingFilesService } from './pending-files.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';

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

  @Delete(':id')
  async deletePendingFile(@Param('id') id: string) {
    await this.pendingFilesService.deletePendingFile(id);
  }
}
