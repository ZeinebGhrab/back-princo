import { ConflictException, Injectable } from '@nestjs/common';
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
    const { name, email, password, role } = createUserDto;
    const checkName = await this.userModel.findOne({ name });
    const checkEmail = await this.userModel.findOne({ email });
    if (checkName && checkEmail) {
      throw new ConflictException('User already exists');
    }
    if (checkEmail) {
      throw new ConflictException('Email already exists');
    }
    if (checkName) {
      throw new ConflictException('Name already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });
    return newUser.save();
  }

  async showUsers(): Promise<User[]> {
    return this.userModel.find();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, email, password } = updateUserDto;
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new ConflictException('User not found');
    }
    if (name && name !== existingUser.name) {
      const checkName = await this.userModel.findOne({ name });
      if (checkName) {
        throw new ConflictException('Name already exists');
      }
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

  async deleteUser(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id);
  }
}
