import { ApiProperty } from '@nestjs/swagger';
import { MapFeature, Position } from '../entities/map-feature.entity';

type FeatureProps = Pick<MapFeature, 'id' | 'name' | 'createdAt' | 'category'>;

export class Geometry {
  @ApiProperty({ example: 'Polygon', description: 'Тип геометрии объекта' })
  type: string;

  @ApiProperty({ example: '[]', description: 'Координаты точек геометрии объекта', isArray: true })
  coordinates: Position[][] | Position[][][];
}

export class Feature {
  @ApiProperty({ example: 'Feature', description: 'Тип feature' })
  type: string;

  @ApiProperty()
  geometry: Geometry;

  @ApiProperty()
  properties: FeatureProps;

  @ApiProperty()
  id: number;
}

export class FeatureCollection {
  @ApiProperty({ example: 'FeatureCollection', description: 'Тип коллекции' })
  type: string;

  @ApiProperty({ description: 'Массив объектов на карте', type: Feature, isArray: true })
  features: Feature[];
}
