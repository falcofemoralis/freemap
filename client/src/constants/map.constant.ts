export default class MapConstant {
  static OSM = 'mapbox://styles/mapbox/streets-v11';
  static GOOGLE = 'mapbox://styles/mapbox/satellite-v9';

  static getMapName(type: MapConstant): string {
    switch (type) {
      case MapConstant.OSM:
        return 'OSM';
      case MapConstant.GOOGLE:
        return 'GOOGLE';
      default:
        return 'OSM';
    }
  }

  static getMapType(name: string): MapConstant {
    switch (name) {
      case 'OSM':
        return MapConstant.OSM;
      case 'GOOGLE':
        return MapConstant.GOOGLE;
      default:
        return MapConstant.OSM;
    }
  }
}
