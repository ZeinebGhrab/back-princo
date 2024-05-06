import {
  Body,
  ConflictException,
  Controller,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ImpressionService } from './impression.service';
import { ImpressionDto } from 'src/impression/dto/impression.dto';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IntegrationDto } from './dto/integration.dto';
import { Response } from 'express';
@Controller('impression')
@UseGuards(JwtAuthGuard)
@Roles(Role.User)
export class ImpressionController {
  constructor(private readonly impressionService: ImpressionService) {}
  @Post()
  async sendNotifications(@Body() impressionDto: ImpressionDto) {
    try {
      const result = await this.impressionService.verifyAndNotify(
        impressionDto.apiKey,
        impressionDto.userId,
        impressionDto.pdfBase64,
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('integrate')
  async getIntegrationCode(
    @Body() integration: IntegrationDto,
  ): Promise<string> {
    try {
      const code = await this.impressionService.integrationService(
        integration.userId,
        integration.pdf,
        integration.apiKey,
      );
      return code;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post('pdf')
  async servePdf(@Body() body: { pdfBase64: string }, @Res() res: Response) {
    try {
      const pdfBase64 = body.pdfBase64;
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).send('Erreur serveur');
    }
  }
}
