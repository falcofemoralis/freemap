import { Position } from 'geojson';
import mapboxgl from 'mapbox-gl';
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

export const getCurrentCoordinates = (window: Window & typeof globalThis, document: Document, map?: mapboxgl.Map): number[][] => {
  // if (map) {
  //   const w = window,
  //     d = document,
  //     e = d.documentElement,
  //     g = d.getElementsByTagName('body')[0],
  //     x = w.innerWidth || e.clientWidth || g.clientWidth,
  //     y = w.innerHeight || e.clientHeight || g.clientHeight;
  //     map?.getCanvasContainer().getClientRects()
  //   const topleft = map.getCoordinateFromPixel([0, 0]);
  //   const topright = map.getCoordinateFromPixel([x, 0]);
  //   const bottomleft = map.getCoordinateFromPixel([0, y]);
  //   const bottomright = map.getCoordinateFromPixel([x, y]);
  //   const coordinates = [topleft, topright, bottomright, bottomleft];
  //   return coordinates;
  // }

  return [];
};
