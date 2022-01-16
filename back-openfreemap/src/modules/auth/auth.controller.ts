import { Controller, Request, Post, UseGuards, Req, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UserDto } from 'shared/dto/auth/user.dto';
import { UserDataDto } from 'shared/dto/auth/userdata.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() userDto: UserDto) {
    if (await this.authService.getUserByLogin(userDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (await this.authService.getUserByEmail(userDto.login)) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    return this.authService.login(await this.authService.register(userDto));
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req): UserDataDto {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Request() req) {
    return this.authService.login(await this.authService.getUserById(req.user.id));
  }
}
