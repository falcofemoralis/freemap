import { MapObjectDto } from './mapobject.dto';

export type FeatureProperties = Omit<MapObjectDto, 'coordinates'>

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