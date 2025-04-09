import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../../../libs/src/dto/users';
import { USER_MESSAGE_PATTERNS } from '../../../libs/src/constants';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USER_MESSAGE_PATTERNS.CREATE_USER)
  async create(@Payload() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.FIND_ALL_USERS)
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.FIND_ONE_USER)
  async findOne(@Payload() id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.UPDATE_USER)
  async update(@Payload() payload: { id: number; updateUserDto: UpdateUserDto }): Promise<User> {
    return this.usersService.update(payload.id, payload.updateUserDto);
  }

  @MessagePattern(USER_MESSAGE_PATTERNS.REMOVE_USER)
  async remove(@Payload() id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}