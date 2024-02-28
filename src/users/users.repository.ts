import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TokenType, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as argon from 'argon2';
import { LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EditUserDto } from './dto/edit-user.dto';
import { ProducerService } from '../queues/producer.service';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly producerService: ProducerService,
  ) {}

  clientURL = this.configService.get('CLIENT_URL');

  async createUser(dto: CreateUserDto): Promise<User> {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExists) throw new BadRequestException('User already exists');

    const hash = await argon.hash(dto.password);
    const user = await this.prismaService.user.create({
      data: {
        ...dto,
        password: hash,
      },
    });

    delete user.password;

    await this.generateToken(dto.email, TokenType.EMAIL_VERIFICATION);

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatch = await argon.verify(user.password, dto.password);
    if (!pwMatch) throw new ForbiddenException('Credentials incorrect');

    return user;
  }

  async editUser(userId: number, dto: EditUserDto) {
    const user = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });

    delete user.password;
    return user;
  }

  async resetPassword(token: string, userId: number, newPassword: string) {
    const user = await this.prismaService.token.findFirst({
      where: { userId },
    });

    const tokenMatch = await argon.verify(user.token, token);

    if (!tokenMatch)
      throw new NotFoundException('Invalid or expired reset password token');

    const hash = await argon.hash(newPassword);
    const updatedUser = await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hash,
      },
    });

    delete updatedUser.password;

    await this.prismaService.token.delete({
      where: {
        userId,
      },
    });

    return { msg: 'You succesfully resetted password' };
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

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw new NotFoundException("User doesn't exist");

    const token = await this.prismaService.token.findUnique({
      where: {
        userId: user.id,
        type,
      },
    });

    if (token)
      await this.prismaService.token.delete({
        where: {
          userId: user.id,
          type,
        },
      });

    const newToken = crypto.randomBytes(32).toString('hex');
    const hash = await argon.hash(newToken);

    await this.prismaService.token.create({
      data: {
        userId: user.id,
        token: hash,
        type,
        expirationTime,
      },
    });

    const username = user.username;

    const link = `${this.clientURL}/${linkType}?token=${newToken}&id=${user.id}`;
    await this.producerService.addToEmailQueue({
      user: { username, email },
      type,
      link,
    });
    return link;
  }

  async activateUser(userId: number): Promise<void> {
    await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        is_active: true,
      },
    });

    await this.prismaService.token.delete({
      where: {
        userId,
        type: TokenType.EMAIL_VERIFICATION,
      },
    });
  }
}
