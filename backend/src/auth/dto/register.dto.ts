import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Niepoprawny format adresu e-mail' })
  @IsNotEmpty({ message: 'E-mail nie może być pusty' })
  email: string;

  @MinLength(6, { message: 'Hasło musi mieć co najmniej 6 znaków' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message:
      'Hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę, jedną cyfrę oraz jeden znak specjalny',
  })
  @IsNotEmpty({ message: 'Hasło nie może być puste' })
  password: string;
}
