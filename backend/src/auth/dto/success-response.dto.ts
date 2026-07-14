import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({
    description: 'Status powodzenia operacji',
    example: true,
  })
  success: boolean;
}
