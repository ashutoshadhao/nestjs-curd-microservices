import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUserDto, UpdateUserDto } from '../../../libs/src/dto/users';
import { USER_MESSAGE_PATTERNS } from '../../../libs/src/constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return firstValueFrom(
      this.userServiceClient.send(USER_MESSAGE_PATTERNS.CREATE_USER, createUserDto)
    );
  }

  async findAll() {
    return firstValueFrom(
      this.userServiceClient.send(USER_MESSAGE_PATTERNS.FIND_ALL_USERS, {})
    );
  }

  async findOne(id: number) {
    return firstValueFrom(
      this.userServiceClient.send(USER_MESSAGE_PATTERNS.FIND_ONE_USER, id)
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return firstValueFrom(
      this.userServiceClient.send(
        USER_MESSAGE_PATTERNS.UPDATE_USER, 
        { id, updateUserDto }
      )
    );
  }

  async remove(id: number) {
    return firstValueFrom(
      this.userServiceClient.send(USER_MESSAGE_PATTERNS.REMOVE_USER, id)
    );
  }
}