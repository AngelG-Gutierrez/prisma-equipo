FROM node:24.16.0

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]
