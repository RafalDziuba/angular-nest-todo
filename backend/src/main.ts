import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Włączenie parsowania ciasteczek
  app.use(cookieParser());

  // Włączenie globalnej walidacji danych (DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Usuwa z żądania parametry, które nie są zdefiniowane w DTO
      transform: true, // Automatycznie konwertuje surowe dane na instancje klas DTO
    }),
  );

  // Konfiguracja CORS pod obsługe ciasteczek (credentials: true wymaga dokładnej domeny zamiast gwiazdki '*')
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Konfiguracja Swaggera
  const config = new DocumentBuilder()
    .setTitle('To-Do App API')
    .setDescription('Dokumentacja API dla aplikacji To-Do (Backend)')
    .setVersion('1.0')
    .addTag('auth', 'Autoryzacja i uwierzytelnianie')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
