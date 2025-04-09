import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { Product } from '../src/products/entities/product.entity';
import { CreateProductDto, UpdateProductDto, UpdateStockDto } from '@app/shared/dto/products';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductsController (Microservice Integration)', () => {
  let app: INestApplication;
  let productsController: ProductsController;
  let productsService: ProductsService;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    stock: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProducts = [
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    productsController = moduleFixture.get<ProductsController>(ProductsController);
    productsService = moduleFixture.get<ProductsService>(ProductsService);
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('find_all_products', () => {
    it('should return an array of products', async () => {
      jest.spyOn(productsService, 'findAll').mockResolvedValue(mockProducts);

      const result = await productsController.findAll();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('find_one_product', () => {
    it('should return a single product by ID', async () => {
      jest.spyOn(productsService, 'findOne').mockResolvedValue(mockProduct);

      const result = await productsController.findOne(1);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      jest.spyOn(productsService, 'findOne').mockRejectedValue(new Error('Product not found'));

      await expect(productsController.findOne(999)).rejects.toThrow('Product not found');
    });
  });

  describe('create_product', () => {
    it('should create a new product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        description: 'A new test product',
        price: 129.99,
        stock: 100,
      };

      const createdProduct = {
        ...mockProduct,
        id: 3,
        name: createProductDto.name,
        description: createProductDto.description,
        price: createProductDto.price,
        stock: createProductDto.stock,
      };

      jest.spyOn(productsService, 'create').mockResolvedValue(createdProduct);

      const result = await productsController.create(createProductDto);
      expect(result).toEqual(createdProduct);
      expect(result.name).toEqual(createProductDto.name);
      expect(result.description).toEqual(createProductDto.description);
      expect(result.price).toEqual(createProductDto.price);
      expect(result.stock).toEqual(createProductDto.stock);
      expect(result.id).toBeDefined();
    });
  });

  describe('update_product', () => {
    it('should update a product', async () => {
      const updateProductDto: UpdateProductDto = {
        name: 'Updated Product',
        price: 159.99,
      };

      const payload = {
        id: 1,
        updateProductDto
      };

      const updatedProduct = {
        ...mockProduct,
        name: updateProductDto.name as string,
        price: updateProductDto.price as number,
      };

      jest.spyOn(productsService, 'update').mockResolvedValue(updatedProduct);

      const result = await productsController.update(payload);
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('update_product_stock', () => {
    it('should update product stock', async () => {
      const updateStockDto: UpdateStockDto = {
        stock: 75,
      };

      const payload = {
        id: 1,
        updateStockDto
      };

      const updatedProduct = {
        ...mockProduct,
        stock: updateStockDto.stock,
      };

      jest.spyOn(productsService, 'updateStock').mockResolvedValue(updatedProduct);

      const result = await productsController.updateStock(payload);
      expect(result.stock).toEqual(updateStockDto.stock);
    });
  });

  describe('remove_product', () => {
    it('should delete a product', async () => {
      jest.spyOn(productsService, 'remove').mockResolvedValue(undefined);

      const result = await productsController.remove(1);
      expect(result).toBeUndefined();
    });
  });
});