import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, Post, Request, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { CredentialsDto } from '../../dto/auth/credentials.dto';
import { CreateUserDto, LoginUserDto, UserDto } from '../../dto/auth/user.dto';
import { hash } from 'bcrypt';
import { User } from './entities/user.entity';

const AVATAR_PATH = './uploads/avatars';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Авторизация пользователя
   * @param {LoginUserDto} loginUserDto - объект с веденным данным пользователя
   * @returns {CredentialsDto} данные аунтефикации
   */
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto): Promise<CredentialsDto> {
    const user = await this.authService.validateUser(loginUserDto.login, loginUserDto.password);

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = await this.authService.createToken(user);
    const avatar = user.avatar;

    return {
      accessToken: token,
      profileAvatar: avatar,
    };
  }

  /**
   * Регистрация пользователя
   * @param {RegisterUserDto} registerUserDto - веденные данные пользователя
   * @returns {CredentialsDto} данные аунтефикации без аватара пользователя
   */
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<CredentialsDto> {
    if (await this.authService.getUserByLogin(createUserDto.login)) {
      throw new HttpException('User with this login is already exists', HttpStatus.CONFLICT);
    }

    if (await this.authService.getUserByEmail(createUserDto.email)) {
      throw new HttpException('User with this email is already exists', HttpStatus.CONFLICT);
    }

    const passwordHash = await hash(createUserDto.password, 10); //salt or round

    const token = await this.authService.createToken(await this.authService.register(new User(createUserDto.login, createUserDto.email, passwordHash)));

    return {
      accessToken: token,
    };
  }

  /**
   * Загрузка аватара пользователя. Будет созданно имя файла по паттерну uuidv4.extname
   * @param req - запрос с объектом пользователя req.user
   * @param file - загруженный файл
   * @returns {string} - имя добавленного файла
   */
  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: AVATAR_PATH,
        filename: (req, file, cb) => {
          if (file) {
            cb(null, v4() + Path.extname(file.originalname));
          }
        },
      }),
      fileFilter: (request, file, cb) => {
        if (!file.mimetype.includes('image')) {
          return cb(new BadRequestException('Provide a valid image'), false);
        }
        cb(null, true);
      },
    }),
  )
  async addAvatar(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<string> {
    await this.authService.updateUserAvatar((req.user as UserDto).id, file.filename);

    return file.filename;
  }

  /**
   * Получение файла аватара пользователя с сервера
   * @param img - название файла
   * @param res - response
   * @returns файл аватара
   */
  @Get('profile/avatar/:img')
  getProfileAvatar(@Param('img') img: string, @Res() res) {
    if (!img) {
      throw new BadRequestException();
    }

    const path = Path.join(process.cwd(), `${AVATAR_PATH}/${img}`);

    try {
      if (fs.existsSync(path)) {
        res.sendFile(path);
      }
    } catch (e) {
      throw new NotFoundException();
    }
  }

  /**
   * Получение пользователя по его id
   * @param id - id пользователя
   * @returns {UserDto} - пользователь
   */
  @Get('profile/user/:id')
  async getProfileById(@Param('id') id: string): Promise<UserDto> {
    if (!id) {
      throw new BadRequestException();
    }

    const user = await this.authService.getUserById(id);
    if (!user) {
      throw new NotFoundException();
    }

    return {
      id,
      login: user.login,
      avatar: user.avatar,
      email: user.email,
    };
  }
}
