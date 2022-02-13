import { ApiProperty } from '@nestjs/swagger';
import { MapFeature } from '../entities/map-feature.entity';

type FeatureProps = Pick<MapFeature, 'id' | 'name' | 'createdAt'>;

export class Geometry {
  @ApiProperty({ example: 'LineString', description: 'Тип геометрии объекта' })
  type: string;

  @ApiProperty({ example: '[[[23, 34], [25, 57]]]', description: 'Координаты точек геометрии объекта', isArray: true })
  coordinates: number[][][];
}

class Feature {
  @ApiProperty({ example: 'Feature', description: 'Тип feature' })
  type: string;

  @ApiProperty()
  properties: FeatureProps;

  @ApiProperty()
  geometry: Geometry;
}

class Projection {
  @ApiProperty({ example: 'EPSG:3857', description: 'Тип проекции объектов' })
  name: string;
}

class CRS {
  @ApiProperty({ example: 'name', description: 'Тип crs' })
  type: string;

  @ApiProperty()
  properties: Projection;
}

export class FeatureCollectionDto {
  @ApiProperty({ example: 'FeatureCollection', description: 'Тип коллекции' })
  type: string;

  @ApiProperty()
  crs: CRS;

  @ApiProperty({ description: 'Массив объектов на карте', type: Feature, isArray: true })
  features: Feature[];
}
