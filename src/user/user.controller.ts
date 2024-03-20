import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  Redirect,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../auth/schemas/user.schema';
import mongoose from 'mongoose';
import { SignUpDto } from '../auth/dto/signup.dto';

@Controller('users')
export class UserController {
  private logger = new Logger('UserService ');
  private readonly transporter;
  constructor(private readonly userService: UserService) {}
  @Get()
  async showUsers(): Promise<User[]> {
    return this.userService.showUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.userService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Body('enterPassword') enterPassword: string,
  ): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('User not valid', 404);
    }
    const updateUser = await this.userService.updateUser(
      id,
      updateUserDto,
      enterPassword,
    );
    if (!updateUser) {
      throw new HttpException('There is no updated user', 404);
    }

    return updateUser;
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') id: string,
    @Body('enterPassword') enterPassword: string,
  ): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
      throw new HttpException('User not valid', 404);
    }
    try {
      const deletedUser = await this.userService.deleteUser(id, enterPassword);
      return deletedUser;
    } catch (error) {
      throw new HttpException('Internal Server Error', 500);
    }
  }
  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
    this.logger.log('Signup request', JSON.stringify(signUpDto));
    return this.userService.signUp(signUpDto);
  }
  @Get('/validate/:email/:token')
  async validateEmail(
    @Param('email') email: string,
    @Param('token') token: string,
  ): Promise<{ message: string }> {
    await this.userService.sendEmailVerification(email, token);
    this.logger.log('Validate email request', email);
    return { message: 'Validation email sent successfully' };
  }
  @Get('verify-email/:token')
  @Redirect('http://localhost:3000/auth/login', 307)
  async verifyEmail(@Param('token') token: string) {
    const { message } = await this.userService.verifyEmail(token);
    return { message, token };
  }
}
