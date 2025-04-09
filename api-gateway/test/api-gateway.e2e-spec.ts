import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { delay } from 'rxjs/operators';
import { ClientProxy } from '@nestjs/microservices';

// Load environment variables
dotenv.config();

// Define interface for message patterns
interface MessagePattern {
  cmd: string;
}

describe('API Gateway (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;
  let dataSource: DataSource;
  let userServiceClientProxy: ClientProxy;
  let productServiceClientProxy: ClientProxy;
  const testDbName = `test_db_${uuidv4().replace(/-/g, '_')}`;

  // Mock user data
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Invalid user data for edge cases
  const invalidUserData = [
    { /* Missing name */ email: 'test@example.com' },
    { name: 'Test User', /* Missing email */ },
    { name: 'Test User', email: 'invalid-email' },
    { name: '', email: 'test@example.com' }, // Empty name
    { name: 'Test User', email: '' }, // Empty email
    { name: 'a'.repeat(101), email: 'test@example.com' }, // Name too long (>100 chars)
  ];

  // Mock product data
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Invalid product data for edge cases
  const invalidProductData = [
    { /* Missing name */ description: 'Test description', price: 99.99, stock: 50 },
    { name: 'Test Product', /* Missing description */ price: 99.99, stock: 50 },
    { name: 'Test Product', description: 'Test description', /* Missing price */ stock: 50 },
    { name: 'Test Product', description: 'Test description', price: 99.99 /* Missing stock */ },
    { name: '', description: 'Test description', price: 99.99, stock: 50 }, // Empty name
    { name: 'Test Product', description: '', price: 99.99, stock: 50 }, // Empty description
    { name: 'Test Product', description: 'Test description', price: -1, stock: 50 }, // Negative price
    { name: 'Test Product', description: 'Test description', price: 99.99, stock: -1 }, // Negative stock
    { name: 'a'.repeat(101), description: 'Test description', price: 99.99, stock: 50 }, // Name too long (>100 chars)
  ];

  beforeAll(async () => {
    // Create test database
    const pgClient = new DataSource({
      type: 'postgres',
      host: process.env.E2E_DB_HOST || 'localhost',
      port:  5432,
      username: process.env.E2E_DB_USER || 'postgres',
      password: process.env.E2E_DB_PASSWORD || 'postgres',
      database: 'postgres', // Connect to default postgres database first
    });

    await pgClient.initialize();
    
    // Create test database
    try {
      await pgClient.query(`CREATE DATABASE ${testDbName}`);
      console.log(`Test database ${testDbName} created successfully`);
    } catch (error) {
      console.error('Error creating test database:', error);
      throw error;
    } finally {
      await pgClient.destroy();
    }

    const mockHttpService = {
      get: jest.fn(() => of({ data: {} })),
      post: jest.fn(() => of({ data: {} })),
      patch: jest.fn(() => of({ data: {} })),
      delete: jest.fn(() => of({ status: 204 })),
    };

    // Mock ClientProxy for microservices
    const mockClientProxy = {
      send: jest.fn().mockImplementation(() => {
        return of({});
      }),
      connect: jest.fn(),
      close: jest.fn(),
      emit: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key) => {
        if (key === 'USER_SERVICE_URL') return process.env.USER_SERVICE_URL || 'http://localhost:3000';
        if (key === 'PRODUCT_SERVICE_URL') return process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
        if (key === 'DB_HOST') return process.env.E2E_DB_HOST || 'localhost';
        if (key === 'DB_PORT') return parseInt(process.env.E2E_DB_PORT as string) || 5432;
        if (key === 'DB_USERNAME') return process.env.E2E_DB_USER || 'postgres';
        if (key === 'DB_PASSWORD') return process.env.E2E_DB_PASSWORD || 'password';
        if (key === 'DB_NAME') return testDbName;
        if (key === 'USER_SERVICE_HOST') return 'localhost';
        if (key === 'USER_SERVICE_PORT') return 4001;
        if (key === 'PRODUCT_SERVICE_HOST') return 'localhost';
        if (key === 'PRODUCT_SERVICE_PORT') return 4002;
        return null;
      }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.E2E_DB_HOST || 'localhost',
          port: 5432,
          username: process.env.E2E_DB_USER || 'postgres',
          password: process.env.E2E_DB_PASSWORD || 'password',
          database: testDbName,
          autoLoadEntities: true,
          synchronize: true, // Automatically create schema for test DB
        }),
      ],
    })
      .overrideProvider(HttpService)
      .useValue(mockHttpService)
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider('USER_SERVICE')
      .useValue(mockClientProxy)
      .overrideProvider('PRODUCT_SERVICE')
      .useValue(mockClientProxy)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    httpService = moduleFixture.get<HttpService>(HttpService);
    dataSource = moduleFixture.get<DataSource>(DataSource);
    userServiceClientProxy = app.get<ClientProxy>('USER_SERVICE');
    productServiceClientProxy = app.get<ClientProxy>('PRODUCT_SERVICE');

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    // Drop test database
    const pgClient = new DataSource({
      type: 'postgres',
      host: process.env.E2E_DB_HOST || 'localhost',
      port: parseInt(process.env.E2E_DB_PORT as string) || 5432,
      username: process.env.E2E_DB_USER || 'postgres',
      password: process.env.E2E_DB_PASSWORD || 'password',
      database: 'postgres', // Connect to default postgres database to drop test DB
    });

    await pgClient.initialize();
    
    try {
      // Force close all connections to the test database
      await pgClient.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${testDbName}'
        AND pid <> pg_backend_pid()
      `);
      
      // Drop the test database
      await pgClient.query(`DROP DATABASE IF EXISTS ${testDbName}`);
      console.log(`Test database ${testDbName} dropped successfully`);
    } catch (error) {
      console.error('Error dropping test database:', error);
    } finally {
      await pgClient.destroy();
    }
  });

  describe('User API', () => {
    describe('Happy Path - User Management', () => {
      
      it('should create and retrieve a user', async () => {
        // Setup mocks for microservice
        jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'create_user') {
            return of(mockUser);
          } else if (pattern.cmd === 'find_one_user') {
            return of(mockUser);
          }
          return of({});
        });

        // Step 1: Create a user
        await request(app.getHttpServer())
          .post('/users')
          .send({
            name: 'Test User',
            email: 'test@example.com',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toEqual(mockUser);
          });

        // Step 2: Retrieve the created user
        await request(app.getHttpServer())
          .get('/users/1')
          .expect(200)
          .expect(mockUser);
      });

      it('should create, update, and delete a user', async () => {
        const updatedUser = { 
          ...mockUser, 
          name: 'Updated User Name' 
        };

        // Setup mocks for microservice
        jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'create_user') {
            return of(mockUser);
          } else if (pattern.cmd === 'update_user') {
            return of(updatedUser);
          } else if (pattern.cmd === 'remove_user') {
            return of(undefined);
          }
          return of({});
        });

        // Step 1: Create a user
        await request(app.getHttpServer())
          .post('/users')
          .send({
            name: 'Test User',
            email: 'test@example.com',
          })
          .expect(201);

        // Step 2: Update the user
        await request(app.getHttpServer())
          .patch('/users/1')
          .send({
            name: 'Updated User Name',
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.name).toEqual('Updated User Name');
          });

        // Step 3: Delete the user
        await request(app.getHttpServer())
          .delete('/users/1')
          .expect(204);
      });

      it('should get all users', async () => {
        const mockUsers = [
          mockUser,
          { 
            ...mockUser, 
            id: 2, 
            name: 'Another User', 
            email: 'another@example.com' 
          }
        ];

        // Setup mocks for microservice
        jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'find_all_users') {
            return of(mockUsers);
          }
          return of({});
        });

        await request(app.getHttpServer())
          .get('/users')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0].id).toBe(1);
            expect(res.body[1].id).toBe(2);
          });
      });
    });

    describe('Edge Cases - User Management', () => {
      it('should handle validation errors when creating a user', async () => {
        for (const invalidData of invalidUserData) {
          await request(app.getHttpServer())
            .post('/users')
            .send(invalidData)
            .expect((res) => {
              expect(res.status).toBeGreaterThanOrEqual(400);
              expect(res.status).toBeLessThan(500);
            });
        }
      });

      it('should handle retrieval of non-existent user', async () => {
        // Setup mock for non-existent user
        jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'find_one_user' && payload === 999) {
            throw new Error('User with ID 999 not found');
          }
          return of({});
        });

        await request(app.getHttpServer())
          .get('/users/999')
          .expect(500); // In a real scenario, you'd want to handle this with a 404
      });

      it('should handle updating non-existent user', async () => {
        // Setup mock for update of non-existent user
        jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'update_user' && payload.id === 999) {
            throw new Error('User with ID 999 not found');
          }
          return of({});
        });

        await request(app.getHttpServer())
          .patch('/users/999')
          .send({
            name: 'Updated Name',
          })
          .expect(500); // In a real scenario, you'd want to handle this with a 404
      });

      it('should handle deleting non-existent user', async () => {
        // Setup mock for deletion of non-existent user
        jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'remove_user' && payload === 999) {
            throw new Error('User with ID 999 not found');
          }
          return of({});
        });

        await request(app.getHttpServer())
          .delete('/users/999')
          .expect(500); // In a real scenario, you'd want to handle this with a 404
      });

      it('should handle unexpected properties in user creation', async () => {
        await request(app.getHttpServer())
          .post('/users')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            unexpectedProp: 'should be stripped or rejected',
          })
          .expect(400);
      });
    });
  });

  describe('Product API', () => {
    describe('Happy Path - Product Management', () => {
      it('should create, update stock, and retrieve a product', async () => {
        // Setup mocks for product-related operations
        const updatedStockProduct = { 
          ...mockProduct, 
          stock: 75 
        };

        jest.spyOn(productServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'create_product') {
            return of(mockProduct);
          } else if (pattern.cmd === 'update_product_stock') {
            return of(updatedStockProduct);
          } else if (pattern.cmd === 'find_one_product') {
            return of(updatedStockProduct);
          }
          return of({});
        });

        // Step 1: Create a product
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: 'Test Product',
            description: 'This is a test product',
            price: 99.99,
            stock: 50,
          })
          .expect(201)
          .expect((res) => {
            expect(res.body).toEqual(mockProduct);
          });

        // Step 2: Update the product stock
        await request(app.getHttpServer())
          .patch('/products/1/stock')
          .send({
            stock: 75,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body.stock).toEqual(75);
          });

        // Step 3: Retrieve the updated product
        await request(app.getHttpServer())
          .get('/products/1')
          .expect(200)
          .expect((res) => {
            expect(res.body.stock).toEqual(75);
          });
      });

      it('should create and then delete a product', async () => {
        // Setup mocks for product creation and deletion
        jest.spyOn(productServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'create_product') {
            return of(mockProduct);
          } else if (pattern.cmd === 'remove_product') {
            return of(undefined);
          }
          return of({});
        });

        // Step 1: Create a product
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: 'Test Product',
            description: 'This is a test product',
            price: 99.99,
            stock: 50,
          })
          .expect(201);

        // Step 2: Delete the product
        await request(app.getHttpServer())
          .delete('/products/1')
          .expect(204);
      });

      it('should get all products', async () => {
        // Setup mocks for getting all products
        const mockProducts = [
          mockProduct, 
          { 
            ...mockProduct, 
            id: 2, 
            name: 'Another Product', 
            description: 'Another test product',
            price: 149.99,
            stock: 25
          }
        ];

        jest.spyOn(productServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'find_all_products') {
            return of(mockProducts);
          }
          return of({});
        });

        await request(app.getHttpServer())
          .get('/products')
          .expect(200)
          .expect((res) => {
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
            expect(res.body[0].id).toBe(1);
            expect(res.body[1].id).toBe(2);
          });
      });
    });

    describe('Edge Cases - Product Management', () => {
      it('should handle validation errors when creating a product', async () => {
        for (const invalidData of invalidProductData) {
          await request(app.getHttpServer())
            .post('/products')
            .send(invalidData)
            .expect((res) => {
              expect(res.status).toBeGreaterThanOrEqual(400);
              expect(res.status).toBeLessThan(500);
            });
        }
      });

      it('should handle invalid price format (non-numeric)', async () => {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: 'Test Product',
            description: 'This is a test product',
            price: 'not-a-number',
            stock: 50,
          })
          .expect(400);
      });

      it('should handle invalid stock format (non-numeric)', async () => {
        await request(app.getHttpServer())
          .post('/products')
          .send({
            name: 'Test Product',
            description: 'This is a test product',
            price: 99.99,
            stock: 'not-a-number',
          })
          .expect(400);
      });

      it('should handle retrieval of non-existent product', async () => {
        // Setup mock for non-existent product
        jest.spyOn(productServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'find_one_product' && payload === 999) {
            throw new Error('Product with ID 999 not found');
          }
          return of({});
        });

        await request(app.getHttpServer())
          .get('/products/999')
          .expect(500); // In a real scenario, you'd want to handle this with a 404
      });

      it('should handle updating stock of non-existent product', async () => {
        // Setup mock for update stock of non-existent product
        jest.spyOn(productServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
          if (pattern.cmd === 'update_product_stock' && payload.id === 999) {
            throw new Error('Product with ID 999 not found');
          }
          return of({});
        });

        await request(app.getHttpServer())
          .patch('/products/999/stock')
          .send({
            stock: 75,
          })
          .expect(500); // In a real scenario, you'd want to handle this with a 404
      });
    });
  });

  describe('Cross-Service Integration', () => {
    it('should demonstrate a full user-product interaction flow', async () => {
      // Setup user creation mock
      jest.spyOn(userServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
        if (pattern.cmd === 'create_user') {
          return of(mockUser);
        }
        return of({});
      });

      // Setup product creation mock
      const updatedStockProduct = { 
        ...mockProduct, 
        stock: 49 
      };

      jest.spyOn(productServiceClientProxy, 'send').mockImplementation((pattern: MessagePattern, payload: any) => {
        if (pattern.cmd === 'create_product') {
          return of(mockProduct);
        } else if (pattern.cmd === 'update_product_stock') {
          return of(updatedStockProduct);
        }
        return of({});
      });

      // Step 1: Create a user (simulating a new customer)
      await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
        })
        .expect(201);

      // Step 2: Create a product (simulating adding inventory)
      await request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'This is a test product',
          price: 99.99,
          stock: 50,
        })
        .expect(201);

      // Step 3: Update product stock (simulating a purchase)
      await request(app.getHttpServer())
        .patch('/products/1/stock')
        .send({
          stock: 49, // Decreased by 1 to simulate a purchase
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.stock).toEqual(49);
        });
    });
  });
});