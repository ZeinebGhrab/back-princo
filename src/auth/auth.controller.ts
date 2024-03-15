import { Body, Controller, Get, Post, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';

@Controller('auth')
export class AuthController {
  private logger = new Logger('AuthController');
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ token: string }> {
    this.logger.log('signup request', JSON.stringify(signUpDto));
    return this.authService.signUp(signUpDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto): Promise<{ token: string }> {
    this.logger.log('login request', JSON.stringify(loginDto));
    return this.authService.login(loginDto);
  }

  @Post('/validate')
  async validateEmail(
    @Body('email') email: string,
  ): Promise<{ message: string }> {
    await this.authService.sendValidationEmail(email);
    this.logger.log('validate request', email);
    return { message: 'Validation email sent successfully' };
  }
  @Post('/forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    this.logger.log('login request', JSON.stringify(forgotPasswordDto));
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ token: string }> {
    this.logger.log('login request', JSON.stringify(changePasswordDto));
    return await this.authService.changePassword(changePasswordDto);
  }
}
