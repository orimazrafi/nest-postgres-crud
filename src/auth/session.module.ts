import { Module } from '@nestjs/common';
import { SessionGuard } from './guards/session.guard';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, SessionGuard],
  exports: [SessionService, SessionGuard],
})
export class SessionModule {}
