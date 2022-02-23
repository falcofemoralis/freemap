import { Level } from './types/level';
import { UserPayload } from './../auth/guards/jwt-auth.guard';
import { BadRequestException, Controller, Get, NotFoundException, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiHeader } from '@nestjs/swagger';
import { User } from '../auth/entities/user.entity';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Получение опыта пользователя по его id' })
  @ApiResponse({ status: 200, type: Number, description: 'Количество опыта пользователя' })
  @ApiHeader({ name: 'auth', description: 'Токен пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('profile/user/experience')
  async getUserExperience(@Req() req): Promise<Level> {
    const experience = await this.usersService.getUserExperience((req.user as UserPayload).id);

    return {
      experience,
      lvl: 0,
    };
  }

  @ApiOperation({ summary: 'Получение профиля пользователя по его id' })
  @ApiResponse({ status: 200, type: User, description: 'Профиль любого пользователя' })
  @Get('profile/user/:id')
  async getUserProfileById(@Param('id') id: string): Promise<User> {
    if (!id) {
      throw new BadRequestException();
    }

    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException();
    }

    user.passwordHash = undefined;

    return user;
  }
}
