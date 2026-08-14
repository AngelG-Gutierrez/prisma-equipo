FROM node:24.16.0

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Generar el cliente de Prisma
RUN npx prisma generate

# Compilar la aplicación
RUN npm run build

EXPOSE 3000

# Ejecutar migraciones e iniciar la app
CMD npm start