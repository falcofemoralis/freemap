import { ITypeStyle } from './ITypeStyle';

export interface IMapFeatureType {
  id: string;
  name: string;
  geometry: string;
  styles: ITypeStyle[][];
  icon?: string;
}
