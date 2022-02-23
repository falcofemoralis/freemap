import { ApiProperty } from '@nestjs/swagger';
export class Level {
  @ApiProperty({ example: '1', description: 'Уровень пользователя' })
  lvl: number;

  @ApiProperty({ example: '1000', description: 'Количество опыта пользователя' })
  experience: number;
}
