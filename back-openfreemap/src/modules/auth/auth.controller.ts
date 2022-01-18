import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
import { UserDto } from 'shared/dto/auth/user.dto';
import { UserDataDto } from 'shared/dto/auth/userdata.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { User } from './entities/user.entity';
import { v4 } from 'uuid';

const AVATAR_PATH = './uploads/avatars';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return {
      accessToken: await this.authService.login(req.user),
      avatarPath: (req.user as User).profileAvatar,
    };
  }

  @Post('register')
  async register(@Body() userDto: UserDto) {
    if (await this.authService.getUserByLogin(userDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (await this.authService.getUserByEmail(userDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (userDto.password != userDto.confirmPassword) {
      throw new HttpException('Passwords not match', HttpStatus.NOT_ACCEPTABLE);
    }

    return {
      accessToken: await this.authService.login(await this.authService.register(userDto)),
    };
  }

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
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(new BadRequestException('Provide a valid image'), false);
        }
        callback(null, true);
      },
    }),
  )
  async addAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    await this.authService.addAvatar(req.user.id, file.filename);
    return { avatarPath: file.filename };
  }

  @Get('profile/:id')
  async getProfileById(@Param('id') id): Promise<UserDataDto> {
    const user = await this.authService.getUserById(id);

    const userDataDto: UserDataDto = {
      id,
      login: user.login,
      avatarUrl: user.profileAvatar,
    };

    return userDataDto;
  }

  @Get('profile/avatar/:img')
  getProfileAvatar(@Param('img') img, @Res() res) {
    res.sendFile(Path.join(process.cwd(), `${AVATAR_PATH}/${img}`));
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/refresh')
  async refresh(@Request() req) {
    return {
      accessToken: await this.authService.login(await this.authService.getUserById(req.user.id)),
    };
  }
}
