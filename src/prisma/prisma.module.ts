import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // הופך את המודול לגלובלי כדי שלא נצטרך לעשות לו import בכל מודול בנפרד
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // מאפשר למודולים אחרים להשתמש ב-PrismaService
})
export class PrismaModule {}
