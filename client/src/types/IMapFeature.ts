import { Position } from 'geojson';
import { ICategory } from './ICategory';
import { IComment } from './IComment';
import { IMapFeatureType } from './IMapFeatureType';
import { IUser } from './IUser';

export type Coordinates = Position[][] | Position[][][];

export interface IMapFeature {
  id: string;
  type: IMapFeatureType;
  coordinates: Coordinates;
  name: string;
  description: string;
  address?: string;
  links?: string[];
  files?: string[];
  createdAt: number;
  wiki?: string;
  phone?: string;
  comments: IComment[];
  user: IUser;
  category?: ICategory;
}

export interface ICreatedMapFeature {
  type: IMapFeatureType;
  coordinates: Coordinates;
  name: string;
  description: string;
  address?: string;
  links?: string[];
  files?: string[];
  wiki?: string;
  phone?: string;
  category?: ICategory;
}
