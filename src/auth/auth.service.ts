import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
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
    roles: Role[];
  }> {
    const { email, password, rememberMe } = loginDto;

    const user = await this.userModel.findOne({
      email,
      emailVerified: true,
      emailVerificationToken: '',
    });
    if (!user) {
      throw new UnauthorizedException(
        'Pas de compte associé à cette adresse e-mail.',
      );
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Veuillez vérifier votre mot de passe.');
    }

    const token = this.jwtService.sign({ id: user._id });

    if (rememberMe) {
      this.setRememberMeCookies(res, email, password);
    }

    return {
      token,
      id: user._id,
      roles: user.roles,
    };
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
      throw new UnauthorizedException('Token invalide');
    }
  }
}
