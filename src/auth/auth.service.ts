import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersRepository } from '../users/users.repository';
import { LoginDto } from '../users/dto/login.dto';
import { TokenType } from './models/token.model';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signUp(dto: CreateUserDto) {
    const user = await this.usersRepository.createUser(dto);

    return this.signToken(user.id, user.email);
  }

  async signIn(dto: LoginDto) {
    const user = await this.usersRepository.login(dto);

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };

    const access_secret = this.config.get('ACCESS_TOKEN_SECRET');
    const refresh_secret = this.config.get('REFRESH_TOKEN_SECRET');

    const access_token = await this.jwt.signAsync(payload, {
      expiresIn: '15min',
      secret: access_secret,
    });
    const refresh_token = await this.jwt.signAsync(payload, {
      expiresIn: '15min',
      secret: refresh_secret,
    });

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token,
      },
    });

    return {
      access_token,
    };
  }

  async verifyUser(email: string, token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });

    const dbToken = await this.prisma.token.findFirst({
      where: {
        userId: user.id,
        type: TokenType.EMAIL_VERIFICATION,
      },
    });

    const tokenMatch = await argon.verify(dbToken.token, token);

    if (!user || !tokenMatch) {
      throw new NotFoundException('Invalid activation link');
    }
    const currentTime = new Date();

    if (dbToken.expirationTime > currentTime) {
      await this.usersRepository.activateUser(user.id);
    } else {
      throw new ForbiddenException('Token is expired');
    }
  }
}
