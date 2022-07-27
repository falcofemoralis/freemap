import { FeatureCollection, MultiLineString, MultiPolygon, Polygon } from 'geojson';
import { ICategory } from './ICategory';
import { IComment } from './IComment';
import { IFeatureType } from './IFeatureType';
import { IMedia } from './IMedia';
import { IUser } from './IUser';

export type GeometryProp = MultiLineString | Polygon | MultiPolygon;
export type GeometryType = GeometryProp['type'];
export type GeometryCoordinates = GeometryProp['coordinates'];

export interface CreateFeatureProps {
  type: string;
  category?: string;
  name: string;
  description?: string;
  address?: string;
  links?: string[];
  phone?: string;
  wiki?: string;
}

export interface FeatureProps {
  id: string;
  type: IFeatureType;
  name: string;
  description: string;
  address?: string;
  links?: string[];
  files?: IMedia[];
  createdAt: number;
  wiki?: string;
  phone?: string;
  comments: IComment[];
  user: IUser;
  category?: ICategory;
}

export interface Source {
  id: string;
  featureCollection: FeatureCollection<GeometryProp, FeatureProps>;
}

export interface Layer {
  id: string;
  type: string;
  layout?: any;
  paint?: any;
  minzoom: number;
  maxzoom: number;
  source: string;
}

export interface IMapData {
  version: number;
  sources: Source[];
  layers: Layer[];
}
