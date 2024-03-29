import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';

import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dto/login.dto';
import { User } from 'src/schemas/user.schema';
import { comparePassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  private readonly transporter;

  constructor(
    @Inject('USER_MODEL') private readonly userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string; id: string }> {
    const { email, password } = loginDto;
    this.logger.log('Received SignUp request', JSON.stringify(loginDto));
    const user = await this.userModel.findOne({ email });
    this.logger.log('Received SignUp request', user.email);
    if (!user) {
      throw new UnauthorizedException("L'email invalide");
    }
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Le mot de passe invalide');
    }
    const token = this.jwtService.sign({ id: user._id });
    this.logger.log(token);
    return { token: token, id: user._id };
  }
}
