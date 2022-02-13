import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsNotEmpty, MaxLength } from 'class-validator';

export interface Coordinate {
  lon: number;
  lat: number;
}

export class CreateFeatureDataDto {
  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'id типа объекта' })
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'qwerty', description: 'Название' })
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Lorem Ipsum Dolor', description: 'Описание' })
  @MaxLength(400)
  description: string;

  @ApiProperty({ example: '[{"lon": 1, "lat": 35}, {"lon": 2, "lat": 36}]', description: 'координаты объекта' })
  @IsNotEmpty()
  @ArrayMinSize(2)
  coordinates: Coordinate[];

  @ApiProperty({ example: '15', description: 'Приближение' })
  @IsNotEmpty()
  zoom: number;

  @ApiProperty({ example: 'qwerty', description: 'Адресс' })
  address?: string;

  @ApiProperty({ example: '[url1, url2]', description: 'Доп. ссылки' })
  links?: string[];

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'Медиа файлы' })
  files: any[];
}
