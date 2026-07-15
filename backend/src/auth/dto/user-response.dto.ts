import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unikalny identyfikator użytkownika',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Adres e-mail użytkownika',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Status weryfikacji konta e-mail',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Imię użytkownika',
    example: 'Jan',
  })
  firstName: string;

  @ApiProperty({
    description: 'Nazwisko użytkownika',
    example: 'Kowalski',
  })
  lastName: string;

  @ApiProperty({
    description: 'Zgoda na przetwarzanie danych osobowych',
    example: true,
  })
  privacyPolicyAccepted: boolean;

  @ApiProperty({
    description: 'Zgoda na otrzymywanie newslettera',
    example: false,
  })
  newsletterAccepted: boolean;

  @ApiProperty({
    description: 'Data utworzenia konta',
    example: '2026-06-27T12:00:00.000Z',
  })
  createdAt: Date;
}
