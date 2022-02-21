import { BadRequestException, Body, Controller, Get, HttpException, HttpStatus, InternalServerErrorException, NotFoundException, Param, Post, Put, Query, Req, Res, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { LoginUserDto } from 'src/modules/auth/dto/login-user.dto';
import { FilesService } from '../files/files.service';
import { FileOptionsQuery } from '../files/query/media.query';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import AvatarInterceptor from './interceptors/avatar.interceptor';

const AVATAR_FOLDER = 'avatar';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly filesService: FilesService) {}

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
  @Get('profile/avatar/:file')
  async getProfileAvatar(@Param('file') file: string, @Res() res: Response, @Query() optionsQuery: FileOptionsQuery) {
    try {
      const avatar = (await this.filesService.downloadFiles([file], { subfolder: AVATAR_FOLDER, fileType: optionsQuery.type }))[0];

      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${avatar.filename}"`,
        'Content-Type': avatar.mimeType,
      });

      res.end(avatar.buffer);
    } catch (e) {
      console.log(e);

      throw new NotFoundException();
    }
  }

  @ApiOperation({ summary: 'Получение профиля пользователя по токену' })
  @ApiResponse({ status: 200, type: User, description: 'Полный профиль пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('profile/user')
  getUserProfile(@Req() req) {
    return this.authService.findUserById(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AvatarInterceptor)
  @ApiOperation({ summary: 'Добавление аватарки' })
  @ApiResponse({ status: 200, type: String })
  @Put('profile/user/avatar')
  async updateUserAvatar(@UploadedFile() avatar: Express.Multer.File, @Req() req): Promise<string> {
    try {
      const fileName = (await this.filesService.saveFiles([avatar], { subfolder: AVATAR_FOLDER, maxWidth: 100, previewMaxWidth: 32 }))[0];
      this.authService.updateUserAvatar(req.user.id, fileName);
      return fileName;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @ApiOperation({ summary: 'Получение профиля пользователя по его id' })
  @ApiResponse({ status: 200, type: User, description: 'Профиль любого пользователя' })
  @Get('profile/user/:id')
  async getUserProfileById(@Param('id') id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException();
    }

    const user = await this.authService.findUserById(id);
    if (!user) {
      throw new NotFoundException();
    }

    user.passwordHash = undefined;

    return user;
  }
}
