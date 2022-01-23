export interface Coordinate {
  lon: number;
  lat: number;
}

export interface MapFeaturePropertiesDto {
  name: string;
  description: string;
  coordinates: number[][];
  zoom: number;
  typeId: string;
  address?: string;
  links?: string[];
  id: string;
  userId: string;
  date?: string;
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