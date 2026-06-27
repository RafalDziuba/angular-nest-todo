import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

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

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
