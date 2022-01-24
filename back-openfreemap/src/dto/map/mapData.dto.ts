import { BadRequestException } from '@nestjs/common';
import { ArrayMinSize, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export interface Coordinate {
  lon: number;
  lat: number;
}

export class ShortFeaturePropertiesDto {
  id: string;
  typeId: string;
  name: string;
  date: string;
}

export class FullFeaturePropertiesDto {
  id?: string;
  userId?: string;
  userLogin?: string;
  userAvatar?: string;

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

  date?: string;
  address?: string;
  links?: string[];
  mediaNames?: Array<string>;
}

export interface MapFeatureDto {
  type: string;
  properties: ShortFeaturePropertiesDto | FullFeaturePropertiesDto;
  geometry: {
    type?: string;
    coordinates: number[][][];
  };
}

export interface MapDataDto {
  type: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  features: MapFeatureDto[];
}

export interface NewestMapFeatureDto {
  id: string;
  userLogin: string;
  userAvatar?: string;
  name: string;
  date: string;
  coordinates: Coordinate[];
  zoom: number;
}
