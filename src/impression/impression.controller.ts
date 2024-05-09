import { Body, ConflictException, Controller, Post } from '@nestjs/common';
import { ImpressionService } from './impression.service';
import { ImpressionDto } from 'src/impression/dto/impression.dto';
import { IntegrationDto } from './dto/integration.dto';
@Controller('impression')
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
}
