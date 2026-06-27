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
    description: 'Data utworzenia konta',
    example: '2026-06-27T12:00:00.000Z',
  })
  createdAt: Date;
}
