import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from '../auth/dto/signup.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  private logger = new Logger('UserService ');
  private readonly transporter;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'mahdisahnoun31@gmail.com',
        pass: 'wyuo mfax zrbi bloq',
      },
    });
  }
  async showUsers(): Promise<User[]> {
    return this.userModel.find().populate(['factures']).exec();
  }

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).populate(['factures']).exec();
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    enterPassword: string,
  ): Promise<User> {
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
    const updatedUser = {
      ...existingUser.toObject(),
      ...updateUserDto,
    };
    return await this.userModel.findByIdAndUpdate(id, updatedUser, {
      new: true,
    });
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
  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    const { firstName, lastName, email, password } = signUpDto;
    const checkUser = await this.userModel.findOne({ email });
    if (checkUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const token = this.jwtService.sign({ id: newUser._id });
    newUser.emailVerificationToken = token;
    await newUser.save();
    await this.sendEmailVerification(email, token);
    this.logger.log('Verification email sent');
    return { message: 'Verification email sent' };
  }
  async sendEmailVerification(email: string, token: string): Promise<void> {
    const mailOptions = {
      from: 'Company <piximind@gmail.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <p>Hello,</p>
        <p>Please click on the following link to verify your email address:</p>
        <p><a href="http://localhost:3000/auth/verify-email/${token}">Verify Email</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({
      emailVerificationToken: token,
    });
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }
}
