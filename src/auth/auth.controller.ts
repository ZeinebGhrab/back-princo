import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { LoginDto } from 'src/auth/dto/login.dto';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto, res);
      return res.json(result);
    } catch (error) {
      throw error;
    }
  }
  @Get('logout')
  async logout(@Res() res: Response) {
    try {
      await this.authService.logout(res);
    } catch (error) {
      throw error;
    }
  }
}
