import { Layer } from '../types/layer';

export class LayerUtil {
  static formatZoom(layer: Layer) {
    if (layer.paint) {
      let jsonPaint = JSON.stringify(layer.paint);
      const minz = layer.minzoom;
      const maxz = layer.maxzoom;
      jsonPaint = jsonPaint
        .replaceAll(`\"$minz\"`, minz.toString())
        .replaceAll(`\"$minz+1\"`, (minz + 1).toString())
        .replaceAll(`\"$minz-1\"`, (minz - 1).toString())
        .replaceAll(`\"$maxz\"`, maxz.toString())
        .replaceAll(`\"$maxz+1\"`, (maxz + 1).toString())
        .replaceAll(`\"$maxz-1\"`, (maxz - 1).toString());

      layer.paint = JSON.parse(jsonPaint);
    }
  }
}
