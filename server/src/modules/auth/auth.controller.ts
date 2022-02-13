import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Res, UnauthorizedException, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as Path from 'path';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import AvatarInterceptor, { AVATAR_PATH } from './interceptors/avatar.interceptor';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiResponse({ status: 200, type: String, description: 'Токен пользователя' })
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.login(loginUserDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    return await this.authService.createToken(user);
  }

  // TODO Нету документации на аватар пользователя
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({ status: 201, type: String, description: 'Токен пользователя' })
  @UseInterceptors(AvatarInterceptor)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    if (await this.authService.findUserByUsername(createUserDto.username)) {
      throw new HttpException('User with this login is already exists', HttpStatus.CONFLICT);
    }

    if (await this.authService.findUserByEmail(createUserDto.email)) {
      throw new HttpException('User with this email is already exists', HttpStatus.CONFLICT);
    }

    return await this.authService.createToken(await this.authService.register(createUserDto));
  }

  @ApiOperation({ summary: 'Получение файла аватара пользователя с сервера' })
  @ApiResponse({ status: 200, type: String, description: 'Аватар пользователя' })
  @Get('profile/avatar/:username')
  getProfileAvatar(@Param('username') username: string, @Res() res) {
    if (!username) {
      throw new BadRequestException();
    }

    // TODO Нету расширения аватара юзера, потому ничего не будет отправлено
    // TODO js convert image to png
    const path = Path.join(process.cwd(), `${AVATAR_PATH}/${username}`);

    try {
      if (fs.existsSync(path)) {
        res.sendFile(path);
      } else {
        throw new NotFoundException();
      }
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @ApiOperation({ summary: 'Получение профиля пользователя по его id' })
  @ApiResponse({ status: 200, type: User, description: 'Профиль пользователя' })
  @Get('profile/user/:id')
  async getProfileById(@Param('id') id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException();
    }

    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }
}
