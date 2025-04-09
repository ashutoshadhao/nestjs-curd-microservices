import { IsOptional, IsNumber, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    example: 'Smartphone X2',
    description: 'The updated name of the product',
    maxLength: 100,
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Updated smartphone with enhanced features and ultra high-resolution camera',
    description: 'The updated description of the product',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 899.99,
    description: 'The updated price of the product',
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({
    example: 75,
    description: 'The updated stock quantity',
    minimum: 0,
    required: false
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}
