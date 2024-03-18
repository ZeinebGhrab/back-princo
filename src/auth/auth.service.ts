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
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';

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

  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    this.logger.log('Received SignUp request', JSON.stringify(signUpDto));
    const { firstName, lastName, email, password } = signUpDto;
    const checkUser = await this.userModel.findOne({ email });
    if (checkUser) {
      throw new ConflictException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    this.logger.log('Hashed password', hashedPassword);

    let emailVerified = false;
    try {
      emailVerified = await this.sendValidationEmail(email, true);
    } catch (error) {
      this.logger.error('Error sending validation email:', error);
    }
    if (!emailVerified) {
      throw new BadRequestException(
        'Error sending validation email. Please try again later.',
      );
    }
    const newUser = await this.userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    const token = this.jwtService.sign({ id: newUser._id });
    this.logger.log('Validation email sent');
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

  async sendValidationEmail(
    email: string,
    isChecked: boolean,
  ): Promise<boolean> {
    const token = crypto.randomBytes(20).toString('hex');
    const verificationLink = `http://localhost:3000/auth/validate?token=${token}`;

    const mailOptions = {
      from: 'piximind@gmail.com',
      to: email,
      subject: 'Email Verification',
      html: `
          <p>Dear User,</p>
          ${
            isChecked
              ? `<p>Please click the following link to verify your email:</p>
               <a href="${verificationLink}">Verify Email</a>`
              : '<p>Email verification is not required.</p>'
          }
      `,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return isChecked;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}
