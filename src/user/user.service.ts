import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/signup.dto';
import { JwtService } from '@nestjs/jwt';
import { encodePassword } from 'src/utils/bcrypt';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update.user.dto';
import { UpdateTickets } from './dto/update.tickets.user.dto';
import * as fs from 'fs/promises';

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

  async getUserById(id: string) {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, profileImage, ...userData } = user.toObject();
    let profileImageUrl = null;
    if (profileImage) {
      profileImageUrl = `${process.env.SERVER_URL}/uploads/profileimages/${profileImage}`;
    }

    return { ...userData, profileImage: profileImageUrl };
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, ...updatedFields }: any = { ...updateUserDto };
    const existingUser = await this.userModel.findById(id);

    if (!existingUser) {
      throw new ConflictException('Utilisateur non trouvé');
    }

    try {
      if (email && existingUser.email !== email) {
        const existingMail = await this.userModel.findOne({ email });
        if (existingMail && existingMail._id.toString() !== id) {
          throw new HttpException(
            'Un compte avec cet e-mail existe déjà.',
            HttpStatus.CONFLICT,
          );
        } else {
          const token = this.jwtService.sign({ id });
          updatedFields.resetEmail = true;
          updatedFields.emailVerificationToken = token;
          await this.sendEmailChangeMail(email, token, existingUser.email);
        }
      }

      if (updateUserDto.password) {
        const hashedPassword = encodePassword(updateUserDto.password);
        updatedFields.password = hashedPassword;
      }

      if (updateUserDto.invoiceDetails) {
        updatedFields.invoiceDetails = updateUserDto.invoiceDetails;
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updatedFields },
        { new: true },
      );

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async updateProfileImage(id: string, file: string) {
    return await this.userModel.findByIdAndUpdate(
      id,
      { $set: { profileImage: file } },
      { new: true },
    );
  }

  async deleteProfileImage(id: string): Promise<void> {
    try {
      const user = await this.userModel.findById(id);
      if (user && user.profileImage) {
        const fileName = user.profileImage.split('/').pop();
        const imagePath = `./uploads/profileimages/${fileName}`;
        await fs.unlink(imagePath);
      }
    } catch (error) {
      throw error;
    }
  }

  async updateTicketsUser(updateUser: UpdateTickets) {
    try {
      const user = await this.userModel.findById(updateUser.userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      let expirationDate: Date;
      if (user.tickets === 0) {
        expirationDate = new Date(updateUser.expirationDate);
      } else {
        expirationDate =
          user.ticketsExpirationDate > new Date(updateUser.expirationDate)
            ? user.ticketsExpirationDate
            : new Date(updateUser.expirationDate);
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
      console.log("Erreur lors de la mise à jour des tickets de l'utilisateur");
    }
  }

  async updateExpiredTicketsToZero() {
    const currentDate = new Date();

    const updateTicketsToZero = await this.userModel
      .updateMany(
        { ticketsExpirationDate: { $lt: currentDate } },
        { $set: { tickets: 0 } },
      )
      .exec();
    return updateTicketsToZero;
  }

  async verifyResetPasswordUser(email: string) {
    try {
      const { resetPassword } = await this.userModel.findOne({ email });
      return resetPassword;
    } catch (error) {
      throw error;
    }
  }

  async verifyActiveAccount(email: string) {
    try {
      const { emailVerified } = await this.userModel.findOne({ email });
      return emailVerified;
    } catch (error) {
      throw error;
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<{ message: string }> {
    const checkUser = await this.userModel.findOne({ email: signUpDto.email });
    if (checkUser) {
      throw new ConflictException('Un compte avec cet e-mail existe déjà.');
    }
    const hashedPassword = encodePassword(signUpDto.password);
    const newUser = await this.userModel.create({
      ...signUpDto,
      password: hashedPassword,
    });
    const token = this.jwtService.sign({ id: newUser._id });
    newUser.emailVerificationToken = token;
    await newUser.save();
    await this.sendEmailVerification(signUpDto.email, token);
    return { message: 'message de vérification envoyé' };
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const url = `${process.env.URL}/verify?token=${token}&initMail=false&email=${email}`;
    const mailOptions = {
      from: ' Princo <princo@gmail.com>',
      to: email,
      subject: "Email d'activation du compte",
      html: `
      <p>Bonjour</p>
      <p>Veuillez cliquer sur le lien suivant pour vérifier votre adresse e-mail :</p>
      <p><a href="${url}">Vérifier l'e-mail</a></p>
      <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet e-mail.</p>
      `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async verifyEmail(
    token: string,
    email: string,
    newEmail?: string,
  ): Promise<{ token: string; id: string }> {
    const updateData: any = {
      emailVerified: true,
      emailVerificationToken: '',
      resetEmail: false,
    };

    if (newEmail) {
      updateData.email = newEmail;
    }

    const user = await this.userModel.findOneAndUpdate(
      { emailVerificationToken: token },
      { $set: updateData },
      { new: true },
    );

    if (!user) {
      const updateUser = await this.userModel.findOne({ email });
      const token = this.jwtService.sign({ id: updateUser._id });
      await this.userModel.findOneAndUpdate(
        { email },
        { $set: { emailVerificationToken: token } },
        { new: true },
      );
      newEmail
        ? await this.sendEmailChangeMail(newEmail, token, email)
        : await this.sendEmailVerification(email, token);
      throw new BadRequestException(
        'Le lien de réinitialisation a expiré. Un nouvel e-mail va être envoyé à votre adresse. Veuillez le consulter.',
      );
    }

    return { token: this.jwtService.sign({ id: user._id }), id: user._id };
  }

  async sendEmailForgotPassword(email: string): Promise<void> {
    const user = await this.userModel.findOneAndUpdate(
      { email },
      { $set: { resetPassword: true } },
    );
    if (!user) {
      throw new HttpException(
        'Pas de compte associé à cette adresse e-mail.',
        HttpStatus.NOT_FOUND,
      );
    }
    const resetLink = `${process.env.URL}/verify?email=${email}`;
    const mailOptions = {
      from: `Princo <princo@gmail.com>`,
      to: email,
      subject: 'Email de réinitialisation de mot de passe',
      html: `
          <p>Bonjour</p>
          <p>Si vous avez demandé à réinitialiser votre mot de passe, cliquez sur le lien ci-dessous :</p>
          <p><a href="${resetLink}">Réinitialiser mon mot de passe</a></p>      
        `,
    };
    await this.transporter.sendMail(mailOptions);
  }

  async sendEmailChangeMail(
    newEmail: string,
    token: string,
    email: string,
  ): Promise<void> {
    try {
      const resetLink = `${process.env.URL}/verify?token=${token}&initMail=true&newEmail=${newEmail}&email=${email}`;
      const mailOptions = {
        from: `Princo <princo@gmail.com>`,
        to: newEmail,
        subject: "Email de réinitialisation d'email",
        html: `
            <p>Bonjour</p>
            <p>Si vous avez demandé à réinitialiser votre email, cliquez sur le lien ci-dessous :</p>
            <p><a href="${resetLink}">Réinitialiser mon email</a></p>      
          `,
      };
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw error;
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
      throw new ConflictException('Votre lien de réinitialisation a expiré.');
    }
    return { token: this.jwtService.sign({ id: user._id }), id: user._id };
  }

  async updateEmailResetPassword() {
    const updateEmail = await this.userModel
      .updateMany({ resetPassword: true }, { $set: { resetPassword: false } })
      .exec();
    return updateEmail;
  }

  async desactiveEmail() {
    await this.userModel.updateMany(
      { emailVerificationToken: { $ne: '' } },
      { $set: { emailVerificationToken: '' } },
    );
  }

  async deleteUserNotConfirmEmail() {
    await this.userModel.deleteMany({ emailVerified: false }).exec();
  }
}
