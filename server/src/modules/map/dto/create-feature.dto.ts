import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsNotEmpty, MaxLength, IsString, IsArray, IsNumber } from 'class-validator';

export interface Coordinate {
  lon: number;
  lat: number;
}

export class CreateFeatureDataDto {
  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'id типа объекта' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: 'qwerty', description: 'Название' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Lorem Ipsum Dolor', description: 'Описание' })
  @MaxLength(1200)
  description: string;

  @ApiProperty({ example: '[{"lon": 1, "lat": 35}, {"lon": 2, "lat": 36}]', description: 'координаты объекта' })
  @IsNotEmpty()
  @ArrayMinSize(2)
  coordinates: Coordinate[];

  @ApiProperty({ example: '15', description: 'Приближение' })
  @IsNumber()
  @IsNotEmpty()
  zoom: number;

  @ApiProperty({ example: 'qwerty', description: 'Адресс' })
  @IsString()
  address?: string;

  @ApiProperty({ example: '[url1, url2]', description: 'Доп. ссылки' })
  @IsArray()
  links?: string[];

  @ApiProperty({ example: '3809153355', description: 'Телефон' })
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'wiki.com/...', description: 'Ссылка на википедию' })
  @IsString()
  wiki?: string;
}
