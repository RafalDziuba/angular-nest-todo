import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const NAME_REGEX =
  /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+(?:[-' ][a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+)*$/;

export class RegisterDto {
  // EMAIL
  @ApiProperty({
    description: 'Adres e-mail użytkownika',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Niepoprawny format adresu e-mail' })
  @IsNotEmpty({ message: 'E-mail nie może być pusty' })
  email: string;

  // PASSWORD
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

  // FIRST NAME
  @ApiProperty({
    description: 'Imię użytkownika',
    example: 'Jan',
  })
  @IsNotEmpty({ message: 'Pole imię jest wymagane' })
  @MaxLength(30, { message: 'Zbyt długie imię' })
  @MinLength(2, { message: 'Zbyt krótkie imię' })
  @Matches(NAME_REGEX, {
    message: 'Imię może zawierać tylko litery, spacje, myślniki lub apostrofy',
  })
  firstName: string;

  // LAST NAME
  @ApiProperty({
    description: 'Nazwisko użytkownika',
    example: 'Kowalski',
  })
  @IsNotEmpty({ message: 'Pole nazwisko jest wymagane' })
  @MaxLength(50, { message: 'Zbyt długie nazwisko' })
  @MinLength(2, { message: 'Zbyt krótkie nazwisko' })
  @Matches(NAME_REGEX, {
    message:
      'Nazwisko może zawierać tylko litery, spacje, myślniki lub apostrofy',
  })
  lastName: string;

  // PRIVACY POLICY
  @ApiProperty({
    description: 'Zgoda na przetwarzanie danych osobowych',
    example: true,
  })
  @IsNotEmpty({ message: 'Zgoda jest wymagana' })
  @IsBoolean({ message: 'Zgoda musi być wartością true lub false' })
  privacyPolicyAccepted: boolean;

  // NEWSLETTER
  @ApiProperty({
    description: 'Zgoda na otrzymywanie newslettera',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Zgoda musi być wartością true lub false' })
  newsletterAccepted: boolean = false;
}
