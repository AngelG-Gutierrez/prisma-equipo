import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; 
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('SINERGIA API')
    .setDescription('Backend de SINERGIA')
    .setVersion('1.0')
    .addBearerAuth() // habilita el uso de JWT
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);

  // Configuración con CDN para que cargue correctamente en Vercel
  SwaggerModule.setup('api', app, documentFactory, {
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  });

  app.useGlobalFilters(new AllExceptionsFilter()); 
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();