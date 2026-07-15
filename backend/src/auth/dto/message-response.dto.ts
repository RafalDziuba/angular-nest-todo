import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Komunikat zwrotny z serwera',
    example: 'Operacja zakończona sukcesem.',
  })
  message: string;
}
