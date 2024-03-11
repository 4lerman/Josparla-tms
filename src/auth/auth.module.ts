import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from '../users/users.repository';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ProducerService } from '../queues/producer.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, JwtStrategy, ProducerService],
})
export class AuthModule {}
