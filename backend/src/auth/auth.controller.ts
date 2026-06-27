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

interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
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
  async getMe(
    @Req() request: RequestWithUser,
  ): Promise<Omit<User, 'password'>> {
    // request.user jest wypełniany przez AuthGuard
    const userId = request.user.sub;
    return this.authService.getUserById(userId);
  }
}
