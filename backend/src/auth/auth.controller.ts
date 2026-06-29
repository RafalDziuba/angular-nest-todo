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
import type { Response, Request, CookieOptions } from 'express';
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
import { AUTH_MESSAGES } from './auth.constants';

interface RequestWithUser extends Request {
  user: {
    sub: number;
    email: string;
  };
}

const COOKIE_OPTIONS: CookieOptions = {
  secure: false,
  sameSite: 'lax',
  path: '/',
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: AUTH_MESSAGES.REGISTER_SUMMARY })
  @ApiCreatedResponse({
    description: AUTH_MESSAGES.REGISTER_CREATED_DESC,
  })
  @ApiBadRequestResponse({
    description: AUTH_MESSAGES.REGISTER_BAD_REQUEST_DESC,
  })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  @ApiOperation({ summary: AUTH_MESSAGES.VERIFY_SUMMARY })
  @ApiQuery({
    name: 'token',
    description: AUTH_MESSAGES.VERIFY_TOKEN_PARAM_DESC,
  })
  @ApiOkResponse({ description: AUTH_MESSAGES.VERIFY_OK_DESC })
  @ApiBadRequestResponse({ description: AUTH_MESSAGES.VERIFY_BAD_REQUEST_DESC })
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  @ApiOperation({ summary: AUTH_MESSAGES.LOGIN_SUMMARY })
  @ApiOkResponse({
    description: AUTH_MESSAGES.LOGIN_OK_DESC,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.LOGIN_UNAUTHORIZED_DESC,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);

    response.cookie('access_token', result.accessToken, {
      ...COOKIE_OPTIONS,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 godziny
    });

    response.cookie('is_logged_in', 'true', {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  @Post('logout')
  @ApiOperation({ summary: AUTH_MESSAGES.LOGOUT_SUMMARY })
  @ApiOkResponse({
    description: AUTH_MESSAGES.LOGOUT_OK_DESC,
  })
  logout(@Res({ passthrough: true }) response: Response): { success: boolean } {
    response.clearCookie('access_token', {
      ...COOKIE_OPTIONS,
      httpOnly: true,
    });

    response.clearCookie('is_logged_in', {
      ...COOKIE_OPTIONS,
      httpOnly: false,
    });

    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiOperation({ summary: AUTH_MESSAGES.GET_ME_SUMMARY })
  @ApiOkResponse({
    description: AUTH_MESSAGES.GET_ME_OK_DESC,
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_MESSAGES.GET_ME_UNAUTHORIZED_DESC,
  })
  async getMe(
    @Req() request: RequestWithUser,
  ): Promise<Omit<User, 'password'>> {
    // request.user jest wypełniany przez AuthGuard
    const userId = request.user.sub;
    return this.authService.getUserById(userId);
  }
}
