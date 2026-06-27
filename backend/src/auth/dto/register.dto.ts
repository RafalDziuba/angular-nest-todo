import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Adres e-mail użytkownika',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Niepoprawny format adresu e-mail' })
  @IsNotEmpty({ message: 'E-mail nie może być pusty' })
  email: string;

  @ApiProperty({
    description:
      'Hasło użytkownika (min. 6 znaków, w tym mała/wielka litera, cyfra, znak specjalny)',
    example: 'SecurePassword123!',
    minLength: 6,
  })
  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message:
      'Hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę, jedną cyfrę oraz jeden znak specjalny',
  })
  @IsNotEmpty({ message: 'Hasło nie może być puste' })
  password: string;
}
