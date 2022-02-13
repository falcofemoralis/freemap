import { toLonLat } from 'ol/proj';
import { Coordinate } from '../types/IMapFeature';

export const toTuple = (coordinates: number[][][]): Coordinate[] => {
    const lotLatCoordinates: Coordinate[] = [];
    for (const tuple of coordinates) {
        for (const coordinate of tuple) {
            const lonLat = toLonLat(coordinate, 'EPSG:3857');
            lotLatCoordinates.push({ lon: lonLat[0], lat: lonLat[1] });
        }
    }

    return lotLatCoordinates;
};
