import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { GeometryType } from 'src/modules/map/constants/geometry.type';
import { Layer } from '../types/layer';

export class FeatureTypeDto {
  @ApiProperty({ example: 'qwerty', description: 'Название типа' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Object.values(GeometryType), description: 'Тип геометрии' })
  @IsEnum(GeometryType)
  @IsNotEmpty()
  geometry: string;

  @ApiProperty({ type: () => [Layer] })
  @IsArray()
  layers: Layer[];

  @ApiProperty({ example: '1.png', description: 'Иконка типа' })
  @IsString()
  @IsOptional()
  icon?: string;
}
