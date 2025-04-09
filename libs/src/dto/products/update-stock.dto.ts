import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStockDto {
  @ApiProperty({
    example: 100,
    description: 'The updated stock quantity',
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stock: number;
}
