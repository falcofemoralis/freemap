import { Layer } from './layer';
import { FeatureCollection } from './feature-collection';

export class LayerSource extends Layer {
  source: string;
}

export class Source {
  id: string;
  featureCollection: FeatureCollection;
}

export class MapData {
  version: number;
  sources: Source[];
  layers: LayerSource[];
}
