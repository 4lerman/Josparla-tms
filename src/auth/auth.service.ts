import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersRepository } from 'src/users/users.repository';
import { LoginDto } from 'src/users/dto/login.dto';

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
}
