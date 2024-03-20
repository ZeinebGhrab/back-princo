import { Body, Controller, Logger, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');

  constructor(private authService: AuthService) {}

  @Get('/login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    this.logger.log('Login request', JSON.stringify(loginDto));
    return this.authService.login(loginDto);
  }
}
