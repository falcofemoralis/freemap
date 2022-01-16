import {
  Controller,
  Request,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile, Param, Res
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

const AVATAR_PATH = './uploads/avatars';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return {
      accessToken: await this.authService.login(req.user),
      avatarPath: (req.user as User).profileAvatar
    };
  }

  @Post('register')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: AVATAR_PATH,
        filename: (req, file, cb) => {
          if (file) {
            const filename: string = (req.body as UserDto).login + Path.extname(file.originalname);

            cb(null, filename);
          }
        }
      })
    })
  )
  async register(@Body() userDto: UserDto, @UploadedFile() avatarFile: Express.Multer.File) {
    if (await this.authService.getUserByLogin(userDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (await this.authService.getUserByEmail(userDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (userDto.password != userDto.confirmPassword) {
      throw new HttpException(
        "Password didn't match",
        HttpStatus.NOT_ACCEPTABLE
      );
    }

    const avatarName: string = avatarFile?.filename;

    return {
      accessToken: await this.authService.login(await this.authService.register(userDto, avatarName)),
      avatarPath: avatarName
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): UserDataDto {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.login(
      await this.authService.getUserById(req.user.id)
    );
  }

  @Get('profile-avatar/:img')
  getProfileAvatar(@Param('img') img, @Res() res) {
    res.sendFile(Path.join(process.cwd(), `${AVATAR_PATH}/${img}`));
  }
}
