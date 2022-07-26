import { Layer } from '../types/map-data';

export class LayerUtil {
  static formatZoom(layer: Layer) {
    if (layer.paint) {
      let jsonPaint = JSON.stringify(layer.paint);
      const minz = layer.minzoom;
      const maxz = layer.maxzoom;

      jsonPaint = jsonPaint
        .replace(/\"$minz\"/g, minz.toString())
        .replace(/\"$minz+1\"/g, (minz + 1).toString())
        .replace(/\"$minz-1\"/g, (minz - 1).toString())
        .replace(/\"$maxz\"/g, maxz.toString())
        .replace(/\"$maxz+1\"/g, (maxz + 1).toString())
        .replace(/\"$maxz-1\"/g, (maxz - 1).toString());

      layer.paint = JSON.parse(jsonPaint);
    }
  }
}
