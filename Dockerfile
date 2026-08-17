FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar proyecto NestJS
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]