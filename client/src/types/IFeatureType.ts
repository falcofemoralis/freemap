import { GeometryType, Layer } from './IMapData';

export interface IFeatureType {
  id: string;
  name: string;
  geometry: GeometryType;
  layers: Layer[];
  icon?: string;
}
