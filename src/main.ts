import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; 
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // inicializar Swagger
  const config = new DocumentBuilder()
  .setTitle('Proyecto - Ejemplo')
  .setDescription('Backend de proyecto de ejemplo')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalFilters(new AllExceptionsFilter()); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
