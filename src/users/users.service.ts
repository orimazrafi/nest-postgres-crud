import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { throwIfUniqueConstraint } from '../common/handle-prisma-error';
import { excludePassword } from '../common/user.util';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto } from '../auth/dto/sign-up.dto';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /** Registers a user with a bcrypt-hashed password. */
  async signUp(data: SignUpDto) {
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          password: hashedPassword,
        },
      });
      return excludePassword(user);
    } catch (error) {
      throwIfUniqueConstraint(error);
    }
  }

  /** Finds a user by email including the password hash (for login only). */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(excludePassword);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return excludePassword(user);
  }

  async update(id: number, data: { email?: string; name?: string }) {
    await this.findOne(id);

    try {
      const user = await this.prisma.user.update({ where: { id }, data });
      return excludePassword(user);
    } catch (error) {
      throwIfUniqueConstraint(error);
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const user = await this.prisma.user.delete({ where: { id } });
    return excludePassword(user);
  }
}
