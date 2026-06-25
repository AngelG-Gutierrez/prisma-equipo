import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/core/databases/prisma.service';


@Injectable()
export class UsersService {
  constructor(private PrismaService: PrismaService) {}

  async createUser(userData: CreateUserDto) {
    const hash = await bcrypt.hash(userData.password, 12);

    const user = await this.PrismaService.user.create({
      data: {
        ...userData,
        password: hash,
      }
    });

    const { id, name, email, username, image } = user;

    return { id, name, email, username, image };
  }

  async findOne(username: string): Promise<any | null> {
    return this.PrismaService.user.findFirst({
      where: {
        username:username,
      },
    });
  }
}