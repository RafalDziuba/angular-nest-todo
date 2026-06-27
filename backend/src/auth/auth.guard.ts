import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  // Czemu służy?: Guard (strażnik) musi sprawdzić, czy w zapytaniu od użytkownika znajduje się poprawne ciasteczko sesyjne. Ciasteczka te przesyłane są w nagłówkach protokołu HTTP.
  // Dlaczego akurat tutaj?: NestJS obsługuje różne protokoły (np. WebSockets, komunikacja gRPC, mikroserwisy TCP). Guard dostaje ogólny obiekt ExecutionContext, który nie ma bezpośrednich właściwości związanych z HTTP. Linijka:
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Brak tokenu uwierzytelniającego.');
    }

    try {
      // Weryfikacja tokenu za pomocą JwtService (klucz pobiera automatycznie z konfiguracji modułu)
      const payload: JwtPayload = await this.jwtService.verifyAsync(token);

      // Zapisujemy ładunek tokenu w obiekcie żądania (np. id użytkownika w sub, email)
      // Dzięki temu kontrolery chronione tym guardem mają dostęp do zalogowanego użytkownika
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Nieprawidłowy lub wygasły token.');
    }

    return true;
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // 1. Sprawdzamy ciasteczka (HttpOnly Cookie)
    if (request.cookies && request.cookies['access_token']) {
      return request.cookies['access_token'] as string;
    }

    // 2. Fallback: sprawdzamy standardowy nagłówek Bearer Token (pomocne do debugowania np. w Insomnii / Postmanie)
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
