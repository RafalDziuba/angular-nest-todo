import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Adres e-mail użytkownika',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Niepoprawny format adresu e-mail' })
  @IsNotEmpty({ message: 'E-mail nie może być pusty' })
  email: string;

  @ApiProperty({
    description: 'Hasło użytkownika',
    example: 'SecurePassword123!',
    minLength: 6,
  })
  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków' })
  @IsNotEmpty({ message: 'Hasło nie może być puste' })
  password: string;
}
