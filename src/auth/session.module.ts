import { Module } from '@nestjs/common';
import { OwnerGuard } from './guards/owner.guard';
import { SessionGuard } from './guards/session.guard';
import { SessionService } from './session.service';

@Module({
  providers: [SessionService, SessionGuard, OwnerGuard],
  exports: [SessionService, SessionGuard, OwnerGuard],
})
export class SessionModule {}
