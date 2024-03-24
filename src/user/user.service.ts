import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from '../dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { InvoiceDetails } from 'src/schemas/invoice.details.schema';
import { InvoiceDetailsDto } from 'src/dto/invoiceDetails.dto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService ');
  private readonly transporter;
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(InvoiceDetails.name)
    private factureModel: Model<InvoiceDetails>,
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

  async getUserById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    password?: string,
    invoiceDetails?: InvoiceDetailsDto,
  ): Promise<User> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new ConflictException('User not found');
    }

    const updatedFields: any = { ...updateUserDto };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.password = hashedPassword;
    }

    if (invoiceDetails) {
      updatedFields.invoiceDetails = invoiceDetails;
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true },
    );
    return updatedUser;
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
      from: ' Princo <princo@gmail.com>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
      <p>Bonjour,</p>
      <p>Veuillez cliquer sur le lien suivant pour vérifier votre adresse e-mail :</p>
      <p><a href="http://localhost:5173/verify?token=${token}">Vérifier l'e-mail</a></p>
      <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet e-mail.</p>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }
  async verifyEmail(token: string): Promise<{ token: string; id: string }> {
    const user = await this.userModel.findOneAndUpdate(
      { emailVerificationToken: token },
      { $set: { emailVerified: true, emailVerificationToken: '' } },
      { new: true },
    );
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }
    return { token: this.jwtService.sign({ id: user._id }), id: user._id };
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const resetLink = `http://localhost:5173/verify?email=${email}`;
    const mailOptions = {
      from: `Princo <princo@gmail.com>`,
      to: email,
      subject: 'Forgotten Password',
      html: `
      <p>Bonjour !</p>
      <p>Si vous avez demandé à réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
      <p><a href=${resetLink}>Réinitialiser mon mot de passe</a></p>      
      `,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log('Error sending email: ', error);
      return false;
    }
  }

  async resetPassword(
    email: string,
    password: string,
  ): Promise<{ token: string; id: string }> {
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { $set: { password: await bcrypt.hash(password, 10) } },
    );
    if (!user) {
      throw new ConflictException('User not found');
    }
    return { token: this.jwtService.sign({ id: user._id }), id: user._id };
  }
}
