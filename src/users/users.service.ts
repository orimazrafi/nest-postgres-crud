import { Injectable, NotFoundException } from '@nestjs/common';
import { throwIfUniqueConstraint } from '../common/handle-prisma-error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  // הזרקת ה-PrismaService דרך ה-Constructor
  constructor(private prisma: PrismaService) {}

  // 1. יצירת משתמש חדש
  async create(data: { email: string; name?: string }) {
    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      throwIfUniqueConstraint(error);
    }
  }

  // 2. שליפת כל המשתמשים
  async findAll() {
    return this.prisma.user.findMany();
  }

  // 3. שליפת משתמש בודד לפי ID
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // 4. עדכון משתמש לפי ID
  async update(id: number, data: { email?: string; name?: string }) {
    // ודואג קודם שהמשתמש קיים
    await this.findOne(id);

    try {
      return await this.prisma.user.update({ where: { id }, data });
    } catch (error) {
      throwIfUniqueConstraint(error);
    }
  }

  // 5. מחיקת משתמש לפי ID
  async remove(id: number) {
    await this.findOne(id);
    
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
