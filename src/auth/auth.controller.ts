import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { sessionCookieOptions } from './cookie.config';
import { SessionGuard } from './guards/session.guard';
import type { SessionUser } from './session.service';

@Controller('auth')
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  /** Registers a new user with a hashed password. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.usersService.signUp(signUpDto);
  }

  /** Authenticates the user and sets an httpOnly session cookie. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { sessionId, expiresAt } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    response.cookie('sid', sessionId, {
      ...sessionCookieOptions(),
      expires: expiresAt,
    });

    return { message: 'Login successful' };
  }

  /** Returns the currently authenticated user from the Redis session. */
  @Get('me')
  @UseGuards(SessionGuard)
  getMe(@CurrentUser() user: SessionUser) {
    return user;
  }

  /** Deletes the Redis session and clears the session cookie. */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const sessionId = request.cookies?.sid as string | undefined;
    await this.authService.logout(sessionId);
    response.clearCookie('sid', sessionCookieOptions());
    return { message: 'Logout successful' };
  }
}
