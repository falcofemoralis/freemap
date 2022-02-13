import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AreaDto {
  @ApiProperty({ example: '10', description: 'Верхняя точка широты' })
  @IsNumber()
  @Type(() => Number)
  latT: number;

  @ApiProperty({ example: '55', description: 'Правая точка долготы' })
  @IsNumber()
  @Type(() => Number)
  lonR: number;

  @ApiProperty({ example: '50', description: 'Нижняя точка широты' })
  @IsNumber()
  @Type(() => Number)
  latB: number;

  @ApiProperty({ example: '5', description: 'Левая точка долготы' })
  @IsNumber()
  @Type(() => Number)
  lonL: number;

  @ApiProperty({ example: '15', description: 'Уровень приближения карты' })
  @IsNumber()
  @Type(() => Number)
  zoom: number;
}
