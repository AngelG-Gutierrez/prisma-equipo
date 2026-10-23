import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/core/databases/prisma.service';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(userData: CreateUserDto) {
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hash = await bcrypt.hash(userData.password, 12);

    const user = await this.prismaService.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        image: userData.image,
        password: hash,
        birthDate: new Date(userData.birthDate),
      },
      omit: {
        password: true,
      },
    });

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { email },
    });
  }

  async findPatients() {
    return this.prismaService.user.findMany({
      where: {
        role: 'Paciente',
        active: true,
      },
      omit: {
        password: true,
      },
    });
  }
}