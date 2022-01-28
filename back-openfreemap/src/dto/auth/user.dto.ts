import { IsEmail, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(4, {
    message: 'Your username must be at least 4 characters',
  })
  @IsNotEmpty({ message: 'Your username can not be blank.' })
  login: string;

  @IsEmail(undefined, { message: 'Invalid email message' })
  @IsNotEmpty({ message: 'Your email can not be blank.' })
  email: string;

  @Length(1, 8, {
    message: 'Your password must be between 1 and 8 characters.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Your password can not be blank.' })
  password: string;
}

export class LoginUserDto {
  @IsString()
  @MinLength(4, {
    message: 'Your username must be at least 4 characters',
  })
  @IsNotEmpty()
  login: string;

  @Length(1, 8, {
    message: 'Your password must be between 1 and 8 characters.',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserDto {
  id: string;
  login: string;
  email: string;
  avatar?: string;
}
