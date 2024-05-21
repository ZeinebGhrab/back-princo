import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/auth/dto/login.dto';
import { comparePassword } from 'src/utils/bcrypt';
import { Response } from 'express';
import { Role } from 'src/role/enums/role.enum';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  private setRememberMeCookies(
    res: Response,
    email: string,
    password: string,
  ): void {
    const cookies = [
      { name: 'rememberedEmail', value: email },
      { name: 'rememberedPassword', value: password },
      { name: 'rememberMe', value: 'true' },
    ];

    cookies.forEach((cookie) => {
      res.cookie(cookie.name, cookie.value, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
      });
    });
  }

  async login(
    loginDto: LoginDto,
    res: Response,
  ): Promise<{
    token: string;
    id: string;
    rememberMe: boolean;
    roles: Role[];
  }> {
    const { email, password, rememberMe } = loginDto;

    const user = await this.userModel.findOne({
      email,
      emailVerified: true,
    });
    const desactiveUser = await this.userModel.findOne({
      email,
      emailVerified: false,
    });

    if (desactiveUser) {
      throw new HttpException(
        "Veuillez d'abord activer votre compte à travers l'email de réinitialisation envoyé.",
        HttpStatus.BAD_REQUEST,
      );
    }

    const inexistingUser = await this.userModel.findOne({ email });
    if (!inexistingUser) {
      throw new HttpException(
        'Pas de compte associé à cette adresse e-mail.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (user) {
      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException(
          'Veuillez vérifier votre mot de passe.',
          HttpStatus.NOT_FOUND,
        );
      }

      const token = this.jwtService.sign({ id: user._id });

      if (rememberMe) {
        this.setRememberMeCookies(res, email, password);
      }

      return {
        token,
        id: user._id,
        rememberMe,
        roles: user.roles,
      };
    }
  }

  async logout(res: Response): Promise<void> {
    ['rememberedEmail', 'rememberedPassword', 'rememberMe'].forEach(
      (cookie) => {
        res.clearCookie(cookie);
      },
    );
  }

  async validateUser(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.userModel.findById(decoded.id).exec();
      return user;
    } catch (error) {
      throw new HttpException('Token invalide', HttpStatus.NOT_FOUND);
    }
  }
}
