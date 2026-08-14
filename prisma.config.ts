import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: "mysql://root:PalomaH1@db:3306/prismaequipo",
  },
});