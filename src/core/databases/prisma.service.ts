import { Injectable} from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(){
    const adapter = new PrismaMariaDb({
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'PalomaH1',
      database: process.env.DB_NAME || 'prismaequipo',
      allowPublicKeyRetrieval: true,
    });

    super({adapter});
  }
}