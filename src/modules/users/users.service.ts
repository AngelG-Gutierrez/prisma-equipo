import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/core/databases/prisma.service';
import { User } from '@prisma/client';


@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userData: CreateUserDto) {
    const hash = await bcrypt.hash(userData.password, 12);

    const user = await this.prismaService.user.create({
      data: {
        name: userData.name,
        username: userData.username,
        email: userData.email,
        image: userData.image,
        password: hash,
        birthDate: new Date(userData.birthDate), 
      },
    });

    const { id, name, email, username, image, role, birthDate } = user;

    return { id, name, email, username, image, role, birthDate };
  }

  async findOne(username: string): Promise<User | null> {
    return this.prismaService.user.findFirst({
      where: {
        username: username,
      },
    });
  }
}