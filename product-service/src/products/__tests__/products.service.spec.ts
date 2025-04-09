import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '../../../../libs/src/dto/products';

// Mock sample data
const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'This is a test product',
  price: 99.99,
  stock: 50,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProductsList = [
  mockProduct,
  {
    id: 2,
    name: 'Another Product',
    description: 'Another test product',
    price: 149.99,
    stock: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn().mockReturnValue(mockProduct),
            save: jest.fn().mockResolvedValue(mockProduct),
            find: jest.fn().mockResolvedValue(mockProductsList),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'This is a test product',
        price: 99.99,
        stock: 50,
      };
      
      // Act
      const result = await service.create(createProductDto);
      
      // Assert
      expect(repository.create).toHaveBeenCalledWith(createProductDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      // Act
      const result = await service.findAll();
      
      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockProductsList);
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockProduct);
      
      // Act
      const result = await service.findOne(1);
      
      // Assert
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);
      
      // Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const updateProductDto: UpdateProductDto = { 
        name: 'Updated Product',
        price: 129.99
      };
      const updatedProduct = { 
        ...mockProduct, 
        name: 'Updated Product', 
        price: 129.99 
      };
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockProduct);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedProduct);
      
      // Act
      const result = await service.update(1, updateProductDto);
      
      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateProductDto.name);
      expect(result.price).toEqual(updateProductDto.price);
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      // Arrange
      const updateProductDto: UpdateProductDto = { name: 'Updated Product' };
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      
      // Assert
      await expect(service.update(999, updateProductDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStock', () => {
    it('should update product stock successfully', async () => {
      // Arrange
      const updateStockDto: UpdateStockDto = { stock: 75 };
      const updatedProduct = { ...mockProduct, stock: 75 };
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockProduct);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedProduct);
      
      // Act
      const result = await service.updateStock(1, updateStockDto);
      
      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
      expect(result.stock).toEqual(updateStockDto.stock);
    });

    it('should throw NotFoundException if product to update stock is not found', async () => {
      // Arrange
      const updateStockDto: UpdateStockDto = { stock: 75 };
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      
      // Assert
      await expect(service.updateStock(999, updateStockDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      // Arrange
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 1, raw: {} });
      
      // Act
      await service.remove(1);
      
      // Assert
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if product to remove is not found', async () => {
      // Arrange
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 0, raw: {} });
      
      // Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(999);
    });
  });
});