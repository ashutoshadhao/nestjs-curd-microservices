import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsService } from './products.service';
import { CreateProductDto ,UpdateProductDto  , UpdateStockDto} from '../../../libs/src/dto/products/index';
import { Product } from './entities/product.entity';
import { PRODUCT_MESSAGE_PATTERNS } from '../../../libs/src/constants'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.CREATE_PRODUCT)
  async create(@Payload() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.FIND_ALL_PRODUCTS)
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.FIND_ONE_PRODUCT)
  async findOne(@Payload() id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.UPDATE_PRODUCT)
  async update(@Payload() payload: { id: number; updateProductDto: UpdateProductDto }): Promise<Product> {
    return this.productsService.update(payload.id, payload.updateProductDto);
  }

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.UPDATE_PRODUCT_STOCK)
  async updateStock(@Payload() payload: { id: number; updateStockDto: UpdateStockDto }): Promise<Product> {
    return this.productsService.updateStock(payload.id, payload.updateStockDto);
  }

  @MessagePattern(PRODUCT_MESSAGE_PATTERNS.REMOVE_PRODUCT)
  async remove(@Payload() id: number): Promise<void> {
    return this.productsService.remove(id);
  }
}