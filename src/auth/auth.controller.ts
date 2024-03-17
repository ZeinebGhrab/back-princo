import { Body, Controller, Post, Logger, Get } from "@nestjs/common";
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
    this.logger.log('Signup request', JSON.stringify(signUpDto));
    return this.authService.signUp(signUpDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    this.logger.log('Login request', JSON.stringify(loginDto));
    return this.authService.login(loginDto);
  }

  @Get('/validate')
  async validateEmail(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.authService.sendValidationEmail(email);
    this.logger.log('Validate email request', email);
    return { message: 'Validation email sent successfully' };
  }
}
