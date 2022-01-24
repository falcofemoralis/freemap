import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  avatar?: string;
}
