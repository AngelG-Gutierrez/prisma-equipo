import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Equipo Sinergia')
    .setDescription('Equipo dinamita')
    .setVersion('1.0')
    .addBearerAuth() // habilita el uso de JWT
    .addTag('gatitos')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  // api es la ruta donde acederemos a la Docs
  // http://localhost:3000/api
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
