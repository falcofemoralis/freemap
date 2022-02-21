import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'email@gmail.com', description: 'Email пользователя' })
  @IsEmail(undefined, { message: 'Invalid email message' })
  @IsNotEmpty({ message: 'Email can not be blank.' })
  email: string;

  @ApiProperty({ example: 'qwerty', description: 'Пароль пользователя' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
