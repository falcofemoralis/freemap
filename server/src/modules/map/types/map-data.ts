import { FeatureCollection, MultiLineString, MultiPolygon, Polygon } from 'geojson';
import { StyleType } from '../constants/style.type';
import { MapFeatureProps } from '../entities/map-feature.entity';

export type GeometryProp = MultiLineString | Polygon | MultiPolygon;
export type GeometryType = GeometryProp['type'];
export type GeometryCoordinates = GeometryProp['coordinates'];

export class Source {
  id: string;
  featureCollection: FeatureCollection<GeometryProp, MapFeatureProps>;
}
export class Layer {
  id: string;
  type: StyleType;
  layout?: any;
  paint?: any;
  minzoom: number;
  maxzoom: number;
}
export class LayerSource extends Layer {
  source: string;
}
export class MapData {
  version: number;
  sources: Source[];
  layers: LayerSource[];
}
