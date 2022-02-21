import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsHexColor, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jane_Doe', description: 'Никнейм пользователя' })
  @IsString()
  @MinLength(4, { message: 'Your username must be at least 4 characters' })
  @IsNotEmpty({ message: 'Your username can not be blank.' })
  username: string;

  @ApiProperty({ example: 'email@gmail.com', description: 'Email пользователя' })
  @IsEmail(undefined, { message: 'Invalid email message' })
  @IsNotEmpty({ message: 'Your email can not be blank.' })
  email: string;

  @ApiProperty({ example: 'qwerty', description: 'Пароль пользователя' })
  @Length(6, 30, { message: 'Your password must be between 6 and 30 characters.' })
  @IsString()
  @IsNotEmpty({ message: 'Your password can not be blank.' })
  password: string;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Файл аватара пользователя' })
  @IsOptional()
  avatar?: any;

  @ApiProperty({ example: '#ff6f00', description: 'Цвет пользователя' })
  @IsHexColor()
  @IsNotEmpty({ message: 'Color can not be blank.' })
  userColor: string;
}
