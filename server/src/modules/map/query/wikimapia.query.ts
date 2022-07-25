import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';
import { TileTypes } from '../../../libs/wikimapia.api';

export class WikimapiaQuery {
  @ApiProperty({ example: '10', description: 'Верхняя точка широты' })
  @IsNumber()
  @Type(() => Number)
  h: number;

  @ApiProperty({ example: '55', description: 'Правая точка долготы' })
  @IsNumber()
  @Type(() => Number)
  w: number;

  @ApiProperty({ example: '50', description: 'Верхня точка широты' })
  @IsNumber()
  @Type(() => Number)
  lat: number;

  @ApiProperty({ example: '5', description: 'Левая точка долготы' })
  @IsNumber()
  @Type(() => Number)
  lng: number;

  @ApiProperty({ example: '15', description: 'Уровень приближения карты' })
  @IsNumber()
  @Type(() => Number)
  zoom: number;

  @IsEnum(TileTypes)
  type: TileTypes;
}
