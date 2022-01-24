import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  login: string;

  @IsNotEmpty()
  password: string;
}
