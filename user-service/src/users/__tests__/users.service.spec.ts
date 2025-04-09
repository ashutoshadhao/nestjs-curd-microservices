import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../../../../libs/src/dto/users';

// Mock sample data
const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersList = [
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

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue(mockUsersList),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };
      
      // Act
      const result = await service.create(createUserDto);
      
      // Assert
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Act
      const result = await service.findAll();
      
      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsersList);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(mockUser);
      
      // Act
      const result = await service.findOne(1);
      
      // Assert
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Arrange
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);
      
      // Assert
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValueOnce(updatedUser);
      
      // Act
      const result = await service.update(1, updateUserDto);
      
      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toEqual(updateUserDto.name);
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException());
      
      // Assert
      await expect(service.update(999, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      // Arrange
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 1, raw: {} });
      
      // Act
      await service.remove(1);
      
      // Assert
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if user to remove is not found', async () => {
      // Arrange
      jest.spyOn(repository, 'delete').mockResolvedValueOnce({ affected: 0, raw: {} });
      
      // Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(999);
    });
  });
});