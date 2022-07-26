import { GeometryConstant } from '@/constants/geometry.type';
import { Layer } from '@/types/IMapData';
import booleanWithin from '@turf/boolean-within';
import { Polygon, Position } from 'geojson';
import mapboxgl from 'mapbox-gl';
import { MapContext } from '@/MapContext';
import { useContext } from 'react';

export const LayerHover = () => {
  const { mainMap } = useContext(MapContext);
  let hoveredStateId: string | number | undefined | null = null;

  if (!mainMap) {
    return null;
  }

  const isPolygonWithBoundary = (feature: mapboxgl.MapboxGeoJSONFeature) => {
    const bounds = mainMap.getBounds();
    let currentCoordinates: number[][] = [];
    if (bounds) {
      currentCoordinates = [
        bounds.getSouthEast().toArray(),
        bounds.getNorthEast().toArray(),
        bounds.getNorthWest().toArray(),
        bounds.getSouthWest().toArray(),
        bounds.getSouthEast().toArray()
      ];
    }

    if (feature.geometry.type == GeometryConstant.POLYGON) {
      return booleanWithin(feature.geometry as Polygon, { type: 'Polygon', coordinates: [currentCoordinates] as Position[][] } as Polygon);
    } else {
      return true;
    }
  };

  const hoverFeature = (feature: mapboxgl.MapboxGeoJSONFeature, layer: Layer) => {
    mainMap.getCanvas().style.cursor = 'pointer';

    // if (hoveredStateId) {
    //   mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
    // }

    hoveredStateId = feature.id;
    if (hoveredStateId) {
      mainMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: true });
    }
  };

  const unHoverFeature = (layer: Layer) => {
    if (hoveredStateId) {
      mainMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
    }
    hoveredStateId = null;
  };

  return null;
};
