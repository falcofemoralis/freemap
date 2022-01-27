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
  userId: string;
  userLogin: string;
  userAvatar?: string;
  name: string;
  createdAt: string;
  zoom: number;
  coordinates: Coordinate[];
}

export class ShortFeatureDataDto {
  id: string;
  name: string;
  createdAt: string;
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
  createdAt: string;
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
