import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. יצירת משתמש (POST http://localhost:3000/users)
  @Post()
  create(@Body() createUserDto: { email: string; name?: string }) {
    return this.usersService.create(createUserDto);
  }

  // 2. קבלת כל המשתמשים (GET http://localhost:3000/users)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // 3. קבלת משתמש בודד לפי ID (GET http://localhost:3000/users/5)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  // 4. עדכון משתמש לפי ID (PATCH http://localhost:3000/users/5)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: { email?: string; name?: string }
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // 5. מחיקת משתמש לפי ID (DELETE http://localhost:3000/users/5)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
