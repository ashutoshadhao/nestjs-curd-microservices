import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateProductDto } from '../../../libs/src/dto/products/create-product.dto';
import { UpdateProductDto } from '../../../libs/src/dto/products/update-product.dto';
import { UpdateStockDto } from '../../../libs/src/dto/products/update-stock.dto';
import { PRODUCT_MESSAGE_PATTERNS } from '../../../libs/src/constants';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productServiceClient: ClientProxy,
  ) {}

  async create(createProductDto: CreateProductDto) {
    return firstValueFrom(
      this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.CREATE_PRODUCT, createProductDto)
    );
  }

  async findAll() {
    return firstValueFrom(
      this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.FIND_ALL_PRODUCTS, {})
    );
  }

  async findOne(id: number) {
    return firstValueFrom(
      this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.FIND_ONE_PRODUCT, id)
    );
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    return firstValueFrom(
      this.productServiceClient.send(
        PRODUCT_MESSAGE_PATTERNS.UPDATE_PRODUCT, 
        { id, updateProductDto }
      )
    );
  }

  async updateStock(id: number, updateStockDto: UpdateStockDto) {
    return firstValueFrom(
      this.productServiceClient.send(
        PRODUCT_MESSAGE_PATTERNS.UPDATE_PRODUCT_STOCK, 
        { id, updateStockDto }
      )
    );
  }

  async remove(id: number) {
    return firstValueFrom(
      this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.REMOVE_PRODUCT, id)
    );
  }
}