import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  signUp(@Body() dto: AuthDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  signIn(@Body() dto: AuthDto) {
    return this.authService.signIn(dto);
  }

  @Post('reset-password')
  resetPasswordEmail(@Body() dto: GenerateTokenDto) {
    return this.authService.generateToken(dto.email, dto.type);
  }

  @Post('reset-password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.userId, dto.password);
  }
}
