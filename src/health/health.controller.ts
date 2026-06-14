import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /** Liveness/readiness probe for Postgres and Redis. */
  @Get()
  check() {
    return this.healthService.check();
  }
}
