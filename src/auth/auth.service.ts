import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto'; // Add this line
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { ChangePasswordDto } from './dto/ChangePasswordDto';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService ');
  private readonly transporter;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 25,
      secure: false,
      auth: {
        user: '22175607bf9746',
        pass: 'eaf961848683fa',
      },
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    this.logger.log('Received SignUp request', JSON.stringify(signUpDto));
    const { name, email, password } = signUpDto;
    const checkName = await this.userModel.findOne({ name });
    const checkEmail = await this.userModel.findOne({ email });
    this.logger.log('details', name, email);
    if (checkName && checkEmail) {
      throw new ConflictException('user already exists');
    }
    if (checkEmail) {
      throw new ConflictException('email already exists');
    }
    if (checkName) {
      throw new ConflictException('name already exists');
    }
    if (checkEmail) {
      throw new ConflictException('email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.log('details', hashedPassword);

    const newUser = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role: 'Client',
    });

    const token = this.jwtService.sign({ id: newUser._id });
    this.logger.log(token);
    return { token };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    this.logger.log('Received SignUp request', JSON.stringify(loginDto));
    const user = await this.userModel.findOne({ email });
    this.logger.log('Received SignUp request', user.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const token = this.jwtService.sign({ id: user._id });
    this.logger.log(token);
    return { token };
  }
  async sendValidationEmail(email: string): Promise<void> {
    const validationToken = crypto.randomBytes(20).toString('hex');
    const user = await this.userModel.findOne({ email });
    this.logger.log(email);
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    await this.userModel.findOneAndUpdate({ email }, { validationToken });
    const mailOptions = {
      from: 'test_email@gmail.com',
      to: user.email,
      subject: 'Email Validation',
      text: `Please click on the following link to validate your email: http://localhost:3000/auth/validate?token=${validationToken}`,
    };
    await this.transporter.sendMail(mailOptions);
  }
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: forgotPasswordDto.email,
    });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }
    const token = this.jwtService.sign({ email: user.email });
    const forgotLink = `http://localhost:3000/auth/change-password?token=${token}`;
    await this.transporter.sendMail({
      from: 'test_email@gmail.com',
      to: user.email,
      subject: 'Reset Password',
      html: `
        <h3>Hello ${user.name}!</h3>
        <p>Please use this <a href="${forgotLink}">link</a> to reset your password.</p>
      `,
    });
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ token: string }> {
    const { email, password } = changePasswordDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    const token = this.jwtService.sign({ id: user._id });
    this.logger.log(token);
    return { token };
  }
}
