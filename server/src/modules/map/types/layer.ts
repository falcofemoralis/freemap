import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { StyleType } from '../constants/style.type';

export class Layer {
  @ApiProperty({ example: 'building-labels', description: 'id стиля' })
  @IsString()
  id: string;

  @ApiProperty({ enum: Object.values(StyleType), description: 'Тип стиля' })
  @IsEnum(StyleType)
  type: StyleType;

  @ApiProperty({ example: '{}', description: 'https://docs.mapbox.com/help/glossary/expression/' })
  layout?: any;

  @ApiProperty({ example: '{}', description: 'https://docs.mapbox.com/help/glossary/expression/' })
  paint?: any;

  @ApiProperty({ example: '5', description: 'Минимальный зум на котором отображаются объекты' })
  @IsNumber()
  @Type(() => Number)
  minzoom: number;

  @ApiProperty({ example: '10', description: 'Максимальный зум на котором отображаются объекты' })
  @IsNumber()
  @Type(() => Number)
  maxzoom: number;
}
