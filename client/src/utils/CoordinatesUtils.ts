import { Position } from 'geojson';
import { GeometryConstant } from '../constants/geometry.type';
import { GeometryCoordinates, GeometryType } from '../types/IMapData';

export const getCenter = (coordinates: GeometryCoordinates | undefined, type: GeometryType | undefined): [number, number] => {
  const arr: Position[] = [];

  if (type == GeometryConstant.POLYGON || type == GeometryConstant.MULTI_LINE_STRING) {
    for (const tuple of coordinates as Position[][]) {
      for (const position of tuple) {
        arr.push(position);
      }
    }
  } else if (type == GeometryConstant.MULTI_POLYGON) {
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

    return `${lat.toFixed(5)}N, ${lon.toFixed(5)}E`;
  }

  return '0, 0';
};
