import { Module } from '@nestjs/common';
import { SessionModule } from '../auth/session.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [SessionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
