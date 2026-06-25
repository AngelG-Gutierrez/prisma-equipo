import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/core/databases/prisma.service';

@Module({
  providers: [PrismaService, UsersService],
  exports: [UsersService]
})
export class UsersModule {}
