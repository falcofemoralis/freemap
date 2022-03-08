import MapConstant from '../constants/map.constant';
import { Coordinate } from '../types/IMapFeature';

export const getQueryParams = (s?: string): Map<string, string> => {
  if (!s || typeof s !== 'string' || s.length < 2) {
    return new Map();
  }

  const a: [string, string][] = s
    .substr(1) // remove `?`
    .split('&') // split by `&`
    .map(x => {
      const a = x.split('=');
      return [a[0], a[1]];
    }); // split by `=`

  return new Map(a);
};

export const updateQuery = (lonLat: Coordinate, zoom: number, featureId: string | null, mapType: MapConstant) => {
  const query = new Array<string>();
  if (lonLat.lon) query.push(`lon=${lonLat.lon}`);
  if (lonLat.lat) query.push(`lat=${lonLat.lat}`);
  if (zoom) query.push(`z=${zoom}`);
  if (mapType) query.push(`map=${MapConstant.getMapName(mapType)}`);
  if (featureId) query.push(`selected=${featureId}`);

  let queryString = '?';
  for (const q of query) {
    if (queryString !== '?') {
      queryString += '&';
    }

    queryString += `${q}`;
  }

  window.history.pushState('object or string', 'Title', queryString);
};
