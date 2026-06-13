import { IsEmail, IsOptional, IsString } from 'class-validator';

/** Payload for updating the authenticated user's profile. */
export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
