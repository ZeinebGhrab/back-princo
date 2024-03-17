import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../auth/schemas/user.schema';
import mongoose from 'mongoose';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  async showUsers(): Promise<User[]> {
    return this.userService.showUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    const isValid = mongoose.Types.ObjectId.isValid(id); // corrected variable name
    if (!isValid) throw new HttpException('User not found', 404); // corrected error message
    const findUser = await this.userService.getUserById(id);
    if (!findUser) throw new HttpException('User not found', 404); // corrected error message
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
}
