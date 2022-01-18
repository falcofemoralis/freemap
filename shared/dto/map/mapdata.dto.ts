import { MapObjectDto } from './mapobject.dto';

export interface FeatureProperties extends Omit<MapObjectDto, 'coordinates'> {
  id: number;
  userId: number;
  mediaNames?: Array<string>;
}

export interface MapFeatureDto {
  type: string,
  properties: FeatureProperties,
  geometry: {
    type: string,
    coordinates: number[][][]
  }
}

export interface MapDataDto {
  type: string,
  crs: {
    type: string,
    properties: {
      name: string
    }
  },
  features: MapFeatureDto[]
}