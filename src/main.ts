import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
=======
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD

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
=======
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
  .setTitle('SINERGIA API')
  .setDescription('Backend de SINERGIA')
  .setVersion('1.0')
  .addBearerAuth() //habilita el uso de JWT
  .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalFilters(new AllExceptionsFilter()); 
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
