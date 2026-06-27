import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';
import { User } from './user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Rejestracja nowego użytkownika' })
  @ApiCreatedResponse({
    description:
      'Użytkownik został pomyślnie zarejestrowany. Link weryfikacyjny został wysłany na e-mail.',
  })
  @ApiBadRequestResponse({
    description: 'Błędne dane wejściowe lub e-mail jest już zajęty.',
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Weryfikacja adresu e-mail za pomocą tokenu' })
  @ApiQuery({
    name: 'token',
    description: 'Token weryfikacyjny wysłany w wiadomości e-mail',
  })
  @ApiOkResponse({ description: 'Konto zostało pomyślnie zweryfikowane.' })
  @ApiBadRequestResponse({ description: 'Niepoprawny token lub token wygasł.' })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiOperation({ summary: 'Logowanie użytkownika' })
  @ApiOkResponse({
    description:
      'Pomyślne logowanie (ustawia ciasteczko sesyjne access_token).',
  })
  @ApiUnauthorizedResponse({ description: 'Niepoprawne dane logowania.' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Ustawiamy ciasteczko HttpOnly
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: false, // ustaw na true na produkcji (HTTPS)
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 godziny
      path: '/',
    });

    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Wylogowanie użytkownika' })
  @ApiOkResponse({
    description: 'Pomyślne wylogowanie (czyści ciasteczko sesyjne).',
  })
  logout(@Res({ passthrough: true }) response: Response): { success: boolean } {
    // Czyścimy ciasteczko ustawiając datę wygaśnięcia w przeszłości
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Pobranie danych zalogowanego użytkownika' })
  @ApiOkResponse({
    description: 'Zwraca dane profilowe użytkownika.',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Brak aktywnej sesji (brak lub niepoprawny token).',
  })
  async getMe(
    @Req() request: RequestWithUser,
  ): Promise<Omit<User, 'password'>> {
    // request.user jest wypełniany przez AuthGuard
    const userId = request.user.sub;
    return this.authService.getUserById(userId);
  }
}
