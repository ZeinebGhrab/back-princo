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
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
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
import { forgetPasswordDto } from './dto/forgotPassword.dto';
import { verifyEmailDto } from './dto/verifyEmail.dto';
import { resetPasswordDto } from './dto/resetPassword.dto';

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
    try {
      const findUser = await this.userService.getUserById(id);
      if (!findUser)
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      return findUser;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.User)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const updateUser = await this.userService.updateUser(id, updateUserDto);
      if (!updateUser) {
        throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
      }

      return updateUser;
    } catch (error) {
      throw error;
    }
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
    @Body() verifyEmail: verifyEmailDto,
  ): Promise<{ token: string; id: string }> {
    return await this.userService.verifyEmail(
      verifyEmail.token,
      verifyEmail.email,
      verifyEmail?.newEmail,
    );
  }

  @Post('/forgotPassword')
  async forgotPassword(
    @Body() forgetPassword: forgetPasswordDto,
  ): Promise<void> {
    return this.userService.sendEmailForgotPassword(forgetPassword.email);
  }

  @Post('/resetPassword')
  async resetPassword(
    @Body() resetPassword: resetPasswordDto,
  ): Promise<{ token: string; id: string }> {
    return this.userService.resetPassword(
      resetPassword.email,
      resetPassword.password,
    );
  }

  @Get('verifyResetPassword/:email')
  async verifyResetPasswordUser(@Param('email') email: string) {
    return this.userService.verifyResetPasswordUser(email);
  }

  @Get('verifyActiveAccount/:email')
  async verifyActiveAccount(@Param('email') email: string) {
    return this.userService.verifyActiveAccount(email);
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateResetPasswordToFalse() {
    await this.userService.updateEmailResetPassword();
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async desactiveEmail() {
    await this.userService.desactiveEmail();
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
