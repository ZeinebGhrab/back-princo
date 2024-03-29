import { Body, Controller, Logger, Post } from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AppController');
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    this.logger.log('Login request', JSON.stringify(loginDto));
    return this.authService.login(loginDto);
  }
}
