import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [JwtModule.register({}), EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
