import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stock: number;
}