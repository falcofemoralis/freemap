import { Position } from 'geojson';
import { GeometryType } from '../constants/geometry.type';
import { Coordinates } from './../types/IMapFeature';

export const getCenter = (coordinates: Coordinates | undefined, type: GeometryType | undefined): [number, number] => {
  const arr: Position[] = [];

  if (type == GeometryType.POLYGON || type == GeometryType.MULTI_LINE_STRING) {
    for (const tuple of coordinates as Position[][]) {
      for (const position of tuple) {
        arr.push(position);
      }
    }
  } else if (type == GeometryType.MULTI_POLYGON) {
    for (const polygons of coordinates as Position[][][]) {
      for (const tuple of polygons) {
        for (const position of tuple) {
          arr.push(position);
        }
      }
    }
  }

  let sumX = 0;
  let sumY = 0;
  let n = 0;

  for (const coordinate of arr) {
    sumX += coordinate[0];
    sumY += coordinate[1];
    n++;
  }

  return [sumX / n, sumY / n];
};

export const toText = (coordinates: [number, number] | undefined): string => {
  if (coordinates) {
    const [lon, lat] = coordinates;

    return `${lon.toFixed(5)}, ${lat.toFixed(5)}`;
  }

  return '0, 0';
};
