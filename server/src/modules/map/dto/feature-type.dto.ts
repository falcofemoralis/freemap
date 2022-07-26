import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GeometryConstant } from 'src/modules/map/constants/geometry.type';
import { Layer } from '../types/map-data';

export class FeatureTypeDto {
  @ApiProperty({ example: 'qwerty', description: 'Название типа' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Object.values(GeometryConstant), description: 'Тип геометрии' })
  @IsEnum(GeometryConstant)
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
