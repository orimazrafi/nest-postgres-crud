import { plainToInstance } from 'class-transformer';
import { IsOptional, IsString, validateSync } from 'class-validator';

/** Validated environment variables loaded at startup. */
class EnvironmentVariables {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  REDIS_URL: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsString()
  PORT?: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;
}

/** Validates required env vars and fails fast when configuration is invalid. */
export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
