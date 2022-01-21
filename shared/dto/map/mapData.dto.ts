import { EnteredMapFeatureDataDto } from './enteredMapFeatureData.dto';

export interface MapFeaturePropertiesDto extends Omit<EnteredMapFeatureDataDto, 'coordinates'> {
  id: number;
  userId: number;
  date: string;
  mediaNames?: Array<string>;
}

export interface MapFeatureDto {
  type: string,
  properties: MapFeaturePropertiesDto,
  geometry: {
    type?: string,
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