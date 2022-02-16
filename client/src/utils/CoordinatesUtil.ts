import { toLonLat } from 'ol/proj';
import { Coordinate } from './../types/IMapFeature';

export const getCenter = (coordinates: Coordinate[]): Coordinate => {
    let sumX = 0;
    let sumY = 0;
    let n = 0;

    for (const coordinate of coordinates) {
        sumX += coordinate.lon;
        sumY += coordinate.lat;
        n++;
    }

    return { lon: sumX / n, lat: sumY / n };
};

export const toArray = (coordinates: Coordinate[]): number[][][] => {
    const featureCoordinates: number[][] = [];
    for (const coordinate of coordinates) {
        featureCoordinates.push([coordinate.lon, coordinate.lat]);
    }

    return [featureCoordinates];
};

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

export const toText = (coordinate: Coordinate): string => {
    return `${coordinate.lon}, ${coordinate.lat}`;
};
