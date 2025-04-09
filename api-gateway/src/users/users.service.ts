import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, EmptyError } from 'rxjs';
import { CreateUserDto, UpdateUserDto } from '../../../libs/src/dto/users';
import { USER_MESSAGE_PATTERNS } from '../../../libs/src/constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await firstValueFrom(
        this.userServiceClient.send(USER_MESSAGE_PATTERNS.CREATE_USER, createUserDto)
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException('User service did not return a response');
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await firstValueFrom(
        this.userServiceClient.send(USER_MESSAGE_PATTERNS.FIND_ALL_USERS, {})
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        return []; // Return empty array instead of throwing when no users found
      }
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await firstValueFrom(
        this.userServiceClient.send(USER_MESSAGE_PATTERNS.FIND_ONE_USER, id)
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      return await firstValueFrom(
        this.userServiceClient.send(
          USER_MESSAGE_PATTERNS.UPDATE_USER, 
          { id, updateUserDto }
        )
      );
    } catch (error) {
      if (error instanceof EmptyError) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.userServiceClient.send(USER_MESSAGE_PATTERNS.REMOVE_USER, id)
      );
      return;
    } catch (error) {
      if (error instanceof EmptyError) {
    
        return;
      }
      throw error;
    }
  }
}