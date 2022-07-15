import { IMapFeature } from './IMapFeature';

export type FeatureProps = Pick<IMapFeature, 'id' | 'name' | 'createdAt' | 'category'>;

export interface Source {
  id: string;
  featureCollection: GeoJSON.FeatureCollection<GeoJSON.Geometry, FeatureProps>;
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
