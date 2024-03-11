import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  signIn(@Body() dto: LoginDto) {
    return this.authService.signIn(dto);
  }

  @Get('verify')
  verifyUser(@Query('email') email: string, @Query('token') token: string) {
    return this.authService.verifyUser(email, token);
  }
}
