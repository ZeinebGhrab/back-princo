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
    res.cookie('rememberedEmail', email, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
    });
    res.cookie('rememberedPassword', password, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
    });
    res.cookie('rememberMe', 'true', {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
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
      throw new UnauthorizedException("L'email invalide");
    }

    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Le mot de passe invalide');
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
