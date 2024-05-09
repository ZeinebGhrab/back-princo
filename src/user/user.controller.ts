import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import mongoose from 'mongoose';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/role/roles.decorator';
import { Role } from 'src/role/enums/role.enum';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update.user.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
  async getUserById(@Param('id') id: string): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not found', 404);
    const findUser = await this.userService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404);
    return findUser;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateExpiredTicketsToZero() {
    await this.userService.updateExpiredTicketsToZero();
  }

  @Post('/signup')
  signUp(@Body() signUpDto: SignUpDto): Promise<{ message: string }> {
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
  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateResetPasswordToFalse() {
    await this.userService.updateEmailResetPassword();
  }

  @Cron('0 0 1 * *')
  async deleteUserNotConfirmEmail() {
    await this.userService.deleteUserNotConfirmEmail();
  }
}
