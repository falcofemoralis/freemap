import { ArrayMinSize, IsNotEmpty, MaxLength } from 'class-validator';

export interface Coordinate {
  lon: number;
  lat: number;
}

export class CreateFeatureDataDto {
  @IsNotEmpty()
  typeId: string;

  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @MaxLength(400)
  description: string;

  @IsNotEmpty()
  @ArrayMinSize(2)
  coordinates: Coordinate[];

  @IsNotEmpty()
  zoom: number;

  address?: string;

  links?: string[];
}

export class NewestFeatureDataDto {
  id: string;
  userLogin: string;
  userAvatar?: string;
  name: string;
  date: string;
  zoom: number;
  coordinates: Coordinate[];
}

export class ShortFeatureDataDto {
  id: string;
  typeId: string;
  name: string;
  date: string;
}

export class FullFeatureDataDto {
  id: string;
  userId: string;
  userLogin: string;
  userAvatar: string;
  typeId: string;
  name: string;
  description: string;
  zoom: number;
  date: string;
  address?: string;
  links?: string[];
  mediaNames?: Array<string>;
  coordinates: Coordinate[];
}

export interface MapFeatureDto<T> {
  type: string;
  properties: T;
  geometry?: {
    type?: string;
    coordinates: number[][][];
  };
}

export interface MapDataDto<T> {
  type: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: MapFeatureDto<T>[];
}
