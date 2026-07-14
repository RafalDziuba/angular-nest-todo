import { IsEmail, IsNotEmpty } from 'class-validator';
import { AUTH_MESSAGES } from '../auth.constants';
import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationDto {
  @ApiProperty({
    description:
      'Adres e-mail użytkownika, na który ma zostać wysłany link weryfikacyjny',
    required: true,
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: AUTH_MESSAGES.EMAIL_IS_REQUIRED })
  @IsEmail({}, { message: AUTH_MESSAGES.INVALID_EMAIL_FORMAT })
  email: string;
}
