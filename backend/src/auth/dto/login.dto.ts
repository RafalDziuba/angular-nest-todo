import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Niepoprawny format adresu e-mail' })
  @IsNotEmpty({ message: 'E-mail nie może być pusty' })
  email: string;

  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków' })
  @IsNotEmpty({ message: 'Hasło nie może być puste' })
  password: string;
}
