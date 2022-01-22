export default class MapType {
  static OSM = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  static GOOGLE = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

  static getMapName(type: MapType): string {
    switch (type) {
      case MapType.OSM:
        return 'OSM';
      case MapType.GOOGLE:
        return 'GOOGLE';
      default:
        return 'OSM';
    }
  }

  static getMapType(name: string): MapType {
    switch (name) {
      case 'OSM':
        return MapType.OSM;
      case 'GOOGLE':
        return MapType.GOOGLE;
      default:
        return MapType.OSM;
    }
  }
}


