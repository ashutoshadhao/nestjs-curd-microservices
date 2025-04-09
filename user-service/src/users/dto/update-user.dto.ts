import { IsEmail, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
  
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}