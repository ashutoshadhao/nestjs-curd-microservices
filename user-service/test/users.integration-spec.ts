import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../libs/src/dto/users/index';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('UsersController (Microservice Integration)', () => {
  let app: INestApplication;
  let usersController: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsers = [
    mockUser,
    {
      id: 2,
      name: 'Another User',
      email: 'another@example.com',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
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
    usersController = moduleFixture.get<UsersController>(UsersController);
    usersService = moduleFixture.get<UsersService>(UsersService);
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('find_all_users', () => {
    it('should return an array of users', async () => {
      jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

      const result = await usersController.findAll();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('find_one_user', () => {
    it('should return a single user by ID', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

      const result = await usersController.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error('User not found'));

      await expect(usersController.findOne(999)).rejects.toThrow('User not found');
    });
  });

  describe('create_user', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'new@example.com',
      };

      const createdUser = {
        ...mockUser,
        id: 3,
        name: createUserDto.name,
        email: createUserDto.email,
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

      const result = await usersController.create(createUserDto);
      expect(result).toEqual(createdUser);
      expect(result.name).toEqual(createUserDto.name);
      expect(result.email).toEqual(createUserDto.email);
      expect(result.id).toBeDefined();
    });
  });

  describe('update_user', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      const payload = {
        id: 1,
        updateUserDto
      };

      const updatedUser = {
        ...mockUser,
        name: updateUserDto.name,
      } as User;

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      const result = await usersController.update(payload);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove_user', () => {
    it('should delete a user', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(undefined);

      const result = await usersController.remove(1);
      expect(result).toBeUndefined();
    });
  });
});