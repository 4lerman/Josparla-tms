import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { QueueModule } from '../queues/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [UsersController],
  providers: [UsersRepository],
})
export class UsersModule {}
