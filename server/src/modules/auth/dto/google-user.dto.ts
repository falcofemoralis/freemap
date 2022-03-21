import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsHexColor, IsNotEmpty, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class GoogleUserDto {
  @ApiProperty({ example: 'Jane_Doe', description: 'Никнейм пользователя' })
  @IsString()
  @MinLength(4, { message: 'Your username must be at least 4 characters' })
  @IsNotEmpty({ message: 'Your username can not be blank.' })
  username: string;

  @ApiProperty({ example: 'email@gmail.com', description: 'Email пользователя' })
  @IsEmail(undefined, { message: 'Invalid email message' })
  @IsNotEmpty({ message: 'Your email can not be blank.' })
  email: string;

  @ApiProperty({ type: 'string', description: 'Ссылка на аватар' })
  @IsOptional()
  googleAvatar?: string;
}
