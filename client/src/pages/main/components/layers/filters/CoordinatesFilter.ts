import { Feature, Map } from 'ol';
import { Geometry } from 'ol/geom';
import { Layer } from 'ol/layer';
import RenderFeature from 'ol/render/Feature';
import { Source } from 'ol/source';

export class CoordinatesFilter {
  map: Map | undefined;

  constructor(map?: Map) {
    this.map = map;
  }

  filter = (feature: Feature<Geometry> | RenderFeature, layer?: Layer<Source, any>) => {
    if (!feature.getProperties().select) {
      return false;
    }
    const featureExtent = feature.getGeometry()?.getExtent();
    const mapExtent = this.map?.getView().calculateExtent(this.map.getSize());

    if (featureExtent && mapExtent) {
      return featureExtent[0] - mapExtent[0] > 0 && featureExtent[1] - mapExtent[1] > 0;
    }

    return false;
  };
}
