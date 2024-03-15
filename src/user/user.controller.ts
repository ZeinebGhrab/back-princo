import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  Logger,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../auth/schemas/user.schema';
import mongoose from 'mongoose';

@Controller('users')
export class UserController {
  private logger = new Logger('UserController');

  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    this.logger.log('Creating user', JSON.stringify(createUserDto));
    return this.userService.createUser(createUserDto);
  }

  @Get()
  async showUsers(): Promise<User[]> {
    this.logger.log('Fetching all users');
    return this.userService.showUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User> {
    this.logger.log('Fetching user by ID', id);
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
  ): Promise<User> {
    this.logger.log('Updating user', id);
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not valid', 404);
    const updateUser = await this.userService.updateUser(id, updateUserDto);
    if (!updateUser) throw new HttpException('There is no updated user', 404);
    return updateUser;
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    this.logger.log('Deleting user', id);
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) throw new HttpException('User not valid', 404);
    const deleteUser = await this.userService.deleteUser(id);
    if (!deleteUser) throw new HttpException('There is no deleted user', 404);
    return deleteUser;
  }
}
