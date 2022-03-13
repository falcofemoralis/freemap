import { GeometryType } from '../constants/geometry.type';
import { Layer } from './IMapData';

export interface IMapFeatureType {
  id: string;
  name: string;
  geometry: GeometryType;
  styles: Layer[];
  icon?: string;
}
