import { UpdateTickets } from './../dto/user/update.tickets.user.dto';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { User } from '../schemas/user.schema/user.schema';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';
import { UpdateUserDto } from '../dto/user/update.user.dto';
import { SignUpDto } from '../dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { InvoiceDetailsDto } from 'src/dto/user/invoiceDetails.dto';
import { encodePassword } from 'src/utils/bcrypt';

@Injectable()
export class UserService {
  private readonly transporter;
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: process.env.SERVICE,
      host: process.env.HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
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
      throw new ConflictException('Utilisateur non trouvé');
    }

    if (updateUserDto.email) {
      const userEmail = await this.userModel.findOne({
        email: updateUserDto.email,
      });
      if (userEmail && userEmail._id !== id) {
        throw new ConflictException(
          'Un autre utilisateur possède déjà cet email',
        );
      }
    }

    const updatedFields: any = { ...updateUserDto };

    if (password) {
      const hashedPassword = encodePassword(password);
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

  async updateTicketsUser(updateUser: UpdateTickets) {
    try {
      const user = await this.userModel.findById(updateUser.userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      let expirationDate: Date;
      if (user.tickets === 0) {
        expirationDate = new Date(
          Date.now() + updateUser.validityPeriod * 24 * 60 * 60 * 1000,
        );
      } else {
        expirationDate = new Date(
          user.ticketsExpirationDate.getTime() +
            updateUser.validityPeriod * 24 * 60 * 60 * 1000,
        );
      }

      const updatedFields = {
        ticketsExpirationDate: expirationDate,
        tickets: user.tickets + parseInt(updateUser.tickets, 10),
      };

      const updatedUser = await this.userModel.findByIdAndUpdate(
        updateUser.userId,
        updatedFields,
        { new: true },
      );
      return updatedUser;
    } catch (error) {
      throw new Error(
        "Erreur lors de la mise à jour des tickets de l'utilisateur",
      );
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    const { firstName, lastName, email, password } = signUpDto;
    const checkUser = await this.userModel.findOne({ email });
    if (checkUser) {
      throw new ConflictException('Un compte avec cet e-mail existe déjà.');
    }
    const hashedPassword = encodePassword(password);
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
    return { message: 'message de vérification envoyé' };
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const mailOptions = {
      from: ' Princo <princo@gmail.com>',
      to: email,
      subject: 'Email de vérification',
      html: `
      <p>Bonjour,</p>
      <p>Veuillez cliquer sur le lien suivant pour vérifier votre adresse e-mail :</p>
      <p><a href="${process.env.url}/verify?token=${token}">Vérifier l'e-mail</a></p>
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
      throw new BadRequestException('token de vérification est invalide');
    }
    return { token: this.jwtService.sign({ id: user._id }), id: user._id };
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { $set: { resetPassword: true } },
    );
    if (!user) {
      throw new HttpException('Utilisateur non trouvé', HttpStatus.NOT_FOUND);
    }
    const resetLink = `${process.env.url}/verify?email=${email}`;
    const mailOptions = {
      from: `Princo <princo@gmail.com>`,
      to: email,
      subject: 'Réinitialiser de mot de passe',
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
      console.log("erreur d'envoyer un email", error);
      return false;
    }
  }

  async resetPassword(
    email: string,
    password: string,
  ): Promise<{ token: string; id: string }> {
    const user = await this.userModel.findOneAndUpdate(
      { email, resetPassword: true },
      { $set: { password: encodePassword(password), resetPassword: false } },
    );
    if (!user) {
      throw new ConflictException(
        'Votre lien de réinitialisation a été utilisé et a expiré.',
      );
    }
    return { token: this.jwtService.sign({ id: user._id }), id: user._id };
  }
}
