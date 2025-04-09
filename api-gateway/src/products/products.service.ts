import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, EmptyError } from 'rxjs';
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
    try {
      return await firstValueFrom(
        this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.CREATE_PRODUCT, createProductDto)
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException('Product service did not return a response');
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await firstValueFrom(
        this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.FIND_ALL_PRODUCTS, {})
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        return []; // Return empty array instead of throwing when no products found
      }
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await firstValueFrom(
        this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.FIND_ONE_PRODUCT, id)
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      return await firstValueFrom(
        this.productServiceClient.send(
          PRODUCT_MESSAGE_PATTERNS.UPDATE_PRODUCT, 
          { id, updateProductDto }
        )
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async updateStock(id: number, updateStockDto: UpdateStockDto) {
    try {
      return await firstValueFrom(
        this.productServiceClient.send(
          PRODUCT_MESSAGE_PATTERNS.UPDATE_PRODUCT_STOCK, 
          { id, updateStockDto }
        )
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.productServiceClient.send(PRODUCT_MESSAGE_PATTERNS.REMOVE_PRODUCT, id)
      );
      return;
    } catch (error) {
      if (error instanceof EmptyError) {
        // Consider it a success if the resource is gone
        return;
      }
      throw error;
    }
  }
}