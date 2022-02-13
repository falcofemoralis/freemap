export default class MapConstant {
    static OSM = 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    static GOOGLE = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';

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
