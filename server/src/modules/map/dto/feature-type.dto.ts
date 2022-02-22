import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { GeometryType } from 'src/modules/map/constants/geometry.type';
import { Prop } from '@nestjs/mongoose';
import { TypeStyle } from '../types/type-style.dto';

export class FeatureTypeDto {
  @ApiProperty({ example: 'qwerty', description: 'Название типа' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Object.values(GeometryType), description: 'Тип геометрии' })
  @IsEnum(GeometryType)
  @IsNotEmpty()
  geometry: string;

  @ApiProperty({ type: () => [[TypeStyle]] })
  @IsArray()
  styles: TypeStyle[][];

  @ApiProperty({ example: '1.png', description: 'Иконка типа' })
  @IsString()
  @IsOptional()
  icon?: string;
}
