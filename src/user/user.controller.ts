import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  HttpException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
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
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = diskStorage({
  destination: './uploads/profileimages',
  filename: (_req, file, cb) => {
    const filename: string = uuidv4();
    const extension: string = path.extname(file.originalname) || '';
    const uniqueFilename = `${filename}${extension}`;
    cb(null, uniqueFilename);
  },
});

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
  async getUserById(@Param('id') id: string) {
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
    @Body('email') email?: string,
  ): Promise<{ token: string; id: string }> {
    return await this.userService.verifyEmail(token, email);
  }

  @Post('/forgotPassword')
  async forgotPassword(@Body('email') email: string): Promise<void> {
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

  @Post('upload/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
  @UseInterceptors(FileInterceptor('file', { storage: storage }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    await this.userService.deleteProfileImage(id);
    return this.userService.updateProfileImage(id, file.filename);
  }
}
