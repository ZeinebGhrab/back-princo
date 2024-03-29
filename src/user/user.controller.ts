import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpException,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';
import mongoose from 'mongoose';
import { SignUpDto } from '../dto/signup.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
export class UserController {
  private logger = new Logger('UserService');
  private readonly transporter;
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.userService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('User not valid', 404);
    }
    const updateUser = await this.userService.updateUser(id, updateUserDto);
    if (!updateUser) {
      throw new HttpException('There is no updated user', 404);
    }

    return updateUser;
  }

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
    this.logger.log('Signup request', JSON.stringify(signUpDto));
    return this.userService.signUp(signUpDto);
  }

  @Post('/verify')
  async verifyEmail(
    @Body('token') token: string,
  ): Promise<{ token: string; id: string }> {
    return await this.userService.verifyEmail(token);
  }

  @Post('/forgotPassword')
  async forgotPassword(@Body('email') email: string): Promise<boolean> {
    return this.userService.sendEmailForgotPassword(email);
  }

  @Post('/resetPassword')
  async resetPassword(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string; id: string }> {
    return this.userService.resetPassword(email, password);
  }
}
