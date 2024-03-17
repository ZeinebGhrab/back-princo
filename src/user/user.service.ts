import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, email, password } = createUserDto;
    const checkEmail = await this.userModel.findOne({ email });
    const checkName = await this.userModel.findOne({ firstName });
    const checkLast = await this.userModel.findOne({ lastName });
    if (checkEmail) {
      throw new ConflictException('email already exists');
    }
    if (checkEmail && checkLast && checkName) {
      throw new ConflictException('user already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async showUsers(): Promise<User[]> {
    return this.userModel.find();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    enterPassword: string,
  ): Promise<User> {
    const { email, password } = updateUserDto;
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new ConflictException('User not found');
    }
    const isPasswordCorrect = await bcrypt.compare(
      enterPassword,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password');
    }
    if (email && email !== existingUser.email) {
      const checkEmail = await this.userModel.findOne({ email });
      if (checkEmail) {
        throw new ConflictException('Email already exists');
      }
    }
    if (password) {
      updateUserDto.password = await bcrypt.hash(password, 10);
    }

    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async deleteUser(id: string, enterPassword: string): Promise<User> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new ConflictException('User not found');
    }
    const isPasswordCorrect = await bcrypt.compare(
      enterPassword,
      existingUser.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password');
    }
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) {
      throw new UnauthorizedException('User not found');
    }
    return deletedUser;
  }
}
