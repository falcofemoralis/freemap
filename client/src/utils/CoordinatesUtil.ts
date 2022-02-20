import { GeometryType } from './../constants/geometry.type';
import { toLonLat } from 'ol/proj';
import { Coordinate } from './../types/IMapFeature';

export const COORDINATE_PRECISION = 5;

// Overload signatures
export function formatCoordinate(coordinate: number[]): Coordinate;
export function formatCoordinate(coordinate: Coordinate): Coordinate;
export function formatCoordinate(coordinate: unknown): Coordinate {
    if (Array.isArray(coordinate)) {
        return {
            lon: Number(coordinate[0].toFixed(COORDINATE_PRECISION)),
            lat: Number(coordinate[1].toFixed(COORDINATE_PRECISION))
        };
    } else {
        return {
            lon: Number((coordinate as Coordinate)?.lon?.toFixed(COORDINATE_PRECISION)),
            lat: Number((coordinate as Coordinate)?.lat?.toFixed(COORDINATE_PRECISION))
        };
    }
}

export function formatZoom(zoom: number): number {
    return Number(zoom.toFixed(COORDINATE_PRECISION));
}

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

export function toArray(coordinates: Coordinate[], type: GeometryType): any {
    const featureCoordinates: number[][] = [];
    for (const coordinate of coordinates) {
        featureCoordinates.push([coordinate.lon, coordinate.lat]);
    }

    if (type == GeometryType.POLYGON || type == GeometryType.MULTI_POLYGON) {
        return [featureCoordinates];
    } else if (type == GeometryType.LINE_STRING) {
        return featureCoordinates;
    } else {
        return featureCoordinates;
    }
}

export function toTuple(coordinates: number[][][], type: GeometryType): Coordinate[];
export function toTuple(coordinates: number[][], type: GeometryType): Coordinate[];
export function toTuple(coordinates: unknown, type: GeometryType): Coordinate[] {
    const lotLatCoordinates: Coordinate[] = [];

    if (type == GeometryType.POLYGON || type == GeometryType.MULTI_POLYGON) {
        for (const tuple of coordinates as number[][][]) {
            for (const coordinate of tuple) {
                const lonLat = toLonLat(coordinate, 'EPSG:3857');
                lotLatCoordinates.push({ lon: lonLat[0], lat: lonLat[1] });
            }
        }

        return lotLatCoordinates;
    } else if (type == GeometryType.LINE_STRING) {
        for (const coordinate of coordinates as number[][]) {
            const lonLat = toLonLat(coordinate, 'EPSG:3857');
            lotLatCoordinates.push({ lon: lonLat[0], lat: lonLat[1] });
        }

        return lotLatCoordinates;
    } else {
        return lotLatCoordinates;
    }
}

export const toText = (coordinate: Coordinate): string => {
    return `${coordinate.lon}, ${coordinate.lat}`;
};
