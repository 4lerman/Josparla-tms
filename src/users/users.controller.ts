import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../common/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { EditUserDto } from './dto/edit-user.dto';
import { GenerateTokenDto } from '../auth/dto/generate-token.dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';
import { UsersRepository } from './users.repository';
import { JwtGuard } from '../auth/guard/jwt.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @UseGuards(JwtGuard)
  @Get('me')
  getUser(@GetUser() user: User) {
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  editUser(@GetUser('id') userId: number, @Body() dto: EditUserDto) {
    return this.usersRepository.editUser(userId, dto);
  }

  @Post('reset-password')
  resetPasswordEmail(@Body() dto: GenerateTokenDto) {
    return this.usersRepository.generateToken(dto.email, dto.type);
  }

  @Post('reset-password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersRepository.resetPassword(
      dto.token,
      dto.userId,
      dto.password,
    );
  }
}
