import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { OwnerGuard } from '../auth/guards/owner.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SessionService } from '../auth/session.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

@Controller('users')
@UseGuards(SessionGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionService: SessionService,
  ) {}

  /** Returns the authenticated user's profile by id (own account only). */
  @Get(':id')
  @UseGuards(OwnerGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /** Updates the authenticated user's profile and refreshes the Redis session. */
  @Patch(':id')
  @UseGuards(OwnerGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    const updatedUser = await this.usersService.update(id, updateUserDto);

    const sessionId = request.cookies?.sid as string | undefined;
    if (sessionId) {
      await this.sessionService.refreshSession(sessionId, updatedUser);
    }

    return updatedUser;
  }

  /** Deletes the authenticated user's account and clears their session. */
  @Delete(':id')
  @UseGuards(OwnerGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const deletedUser = await this.usersService.remove(id);

    const sessionId = request.cookies?.sid as string | undefined;
    if (sessionId) {
      await this.sessionService.delete(sessionId);
    }
    response.clearCookie('sid', cookieOptions);

    return deletedUser;
  }
}
