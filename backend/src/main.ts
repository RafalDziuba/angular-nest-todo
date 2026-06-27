import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Włączenie globalnej walidacji danych (DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Usuwa z żądania parametry, które nie są zdefiniowane w DTO
      transform: true, // Automatycznie konwertuje surowe dane na instancje klas DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
