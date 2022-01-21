import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { EnteredUserDataDto } from 'shared/dto/auth/enteredUserData.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import { CredentialsDto } from 'shared/dto/auth/credentials.dto';
import { UserDto } from 'shared/dto/auth/user.dto';
import * as fs from 'fs';

const AVATAR_PATH = './uploads/avatars';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Авторизация пользователя
   * @param req - запрос с объектом пользователя req.user
   * @returns {CredentialsDto} данные аунтефикации
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<CredentialsDto> {
    const token = await this.authService.createToken(req.user);
    const avatar = (req.user as UserDto).avatar;

    return {
      accessToken: token,
      profileAvatar: avatar,
    };
  }

  /**
   * Регистрация пользователя
   * @param {EnteredUserDataDto} enteredUserDataDto - веденные данные пользователя
   * @returns {CredentialsDto} данные аунтефикации без аватара пользователя
   */
  @Post('register')
  async register(@Body() enteredUserDataDto: EnteredUserDataDto): Promise<CredentialsDto> {
    if (await this.authService.getUserByLogin(enteredUserDataDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (await this.authService.getUserByEmail(enteredUserDataDto.email)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (enteredUserDataDto.password != enteredUserDataDto.confirmPassword) {
      throw new HttpException('Passwords not match', HttpStatus.NOT_ACCEPTABLE);
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(enteredUserDataDto.email)) {
      throw new HttpException('Incorrect email', HttpStatus.CONFLICT);
    }

    if (enteredUserDataDto.login.length > 30) {
      throw new HttpException('Login is too long', HttpStatus.CONFLICT);
    }

    if (enteredUserDataDto.password.length < 6) {
      throw new HttpException('Password is too short', HttpStatus.CONFLICT);
    }

    if (enteredUserDataDto.password.length > 50) {
      throw new HttpException('Password is too long', HttpStatus.CONFLICT);
    }

    const token = await this.authService.createToken(await this.authService.register(enteredUserDataDto));

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
   * Получение пользователя по его id
   * @param id - id пользователя
   * @returns {UserDto} - пользователь
   */
  @Get('profile/:id')
  async getProfileById(@Param('id') id): Promise<UserDto> {
    const user = await this.authService.getUserById(id);

    return {
      id,
      login: user.login,
      avatar: user.avatar,
      email: user.email,
    };
  }

  /**
   * Получение файла аватара пользователя с сервера
   * @param img - название файла
   * @param res - response
   * @returns файл аватара
   */
  @Get('profile/avatar/:img')
  getProfileAvatar(@Param('img') img, @Res() res) {
    const path = Path.join(process.cwd(), `${AVATAR_PATH}/${img}`);

    try {
      if (fs.existsSync(path)) {
        res.sendFile(path);
      }
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
