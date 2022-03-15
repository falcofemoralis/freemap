import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Position } from '../entities/map-feature.entity';

export class CreateFeatureDataDto {
  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'id типа' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'id категории' })
  @IsString()
  category?: string;

  @ApiProperty({ example: 'qwerty', description: 'Название' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'Lorem Ipsum Dolor', description: 'Описание' })
  @MaxLength(1200)
  description: string;

  @ApiProperty({ example: '[]', description: 'Координаты объекта' })
  @IsNotEmpty()
  @ArrayMinSize(1)
  coordinates: Position[][] | Position[][][];

  @ApiProperty({ example: 'qwerty', description: 'Адрес' })
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
