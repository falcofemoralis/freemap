import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

import { GeometryType } from 'src/modules/map/constants/geometry.type';

export class FeatureTypeDto {
  @ApiProperty({ example: 'qwerty', description: 'Название типа' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Object.values(GeometryType), description: 'Тип геометрии' })
  @IsEnum(GeometryType)
  @IsNotEmpty()
  geometry: string;
}
