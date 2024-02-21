import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as argon from 'argon2';
import { TokenType } from '@prisma/client';
import * as crypto from 'crypto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private emailService: EmailService,
  ) {}

  clientURL = this.config.get('CLIENT_URL');

  async signUp(dto: AuthDto) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExists) throw new BadRequestException('User already exists');

    const hash = await argon.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hash,
      },
    });

    delete user.password;

    return this.signToken(user.id, user.email);
  }

  async signIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatch = await argon.verify(user.password, dto.password);
    if (!pwMatch) throw new ForbiddenException('Credentials incorrect');

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

  async generateToken(email: string, type: TokenType) {
    let linkType: string;
    const expirationTime = new Date();

    if (type === TokenType.RESET_PASSWORD) {
      expirationTime.setMinutes(expirationTime.getMinutes() + 15);
      linkType = 'resetPassword';
    } else if (type === TokenType.EMAIL_VERIFICATION) {
      expirationTime.setHours(expirationTime.getHours() + 24);
      linkType = 'emailVerification';
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException("User doesn't exist");

    const token = await this.prisma.token.findUnique({
      where: {
        userId: user.id,
        type,
      },
    });

    if (token)
      await this.prisma.token.delete({
        where: {
          userId: user.id,
          type,
        },
      });

    const newToken = crypto.randomBytes(32).toString('hex');
    const hash = await argon.hash(newToken);

    await this.prisma.token.create({
      data: {
        userId: user.id,
        token: hash,
        type,
        expirationTime,
      },
    });

    const username = user.username;

    const link = `${this.clientURL}/${linkType}?token=${newToken}&id=${user.id}`;
    await this.emailService.sendEmail({ email, username }, type, link);
    return link;
  }

  async resetPassword(token: string, userId: number, newPassword: string) {
    const user = await this.prisma.token.findFirst({
      where: { userId },
    });

    const tokenMatch = await argon.verify(user.token, token);

    if (!tokenMatch)
      throw new NotFoundException('Invalid or expired reset password token');

    const hash = await argon.hash(newPassword);
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hash,
      },
    });

    delete updatedUser.password;

    await this.prisma.token.delete({
      where: {
        userId,
      },
    });

    return { msg: 'You succesfully resetted password' };
  }
}
