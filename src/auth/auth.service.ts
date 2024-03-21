import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dto/login.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService ');
  private readonly transporter;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto): Promise<{ token: string; id: string }> {
    const { email, password } = loginDto;
    this.logger.log('Received SignUp request', JSON.stringify(loginDto));
    const user = await this.userModel.findOne({ email });
    this.logger.log('Received SignUp request', user.email);
    if (!user) {
      throw new UnauthorizedException("L'email ou le mot de passe invalide");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("L'email ou le mot de passe invalide");
    }
    const token = this.jwtService.sign({ id: user._id });
    this.logger.log(token);
    return { token: token, id: user._id };
  }
}
