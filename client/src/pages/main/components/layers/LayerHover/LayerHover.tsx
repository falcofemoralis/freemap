import { GeometryConstant } from '@/constants/geometry.type';
import { MapContext } from '@/MapContext';
import { editorStore } from '@/store/editor.store';
import { mapStore } from '@/store/map.store';
import { Layer } from '@/types/IMapData';
import booleanWithin from '@turf/boolean-within';
import { Polygon, Position } from 'geojson';
import mapboxgl from 'mapbox-gl';
import { observer } from 'mobx-react-lite';
import { useContext } from 'react';

export const LayerHover = observer(() => {
  const { mainMap } = useContext(MapContext);
  let hoveredStateId: string | number | undefined | null = null;

  if (!mainMap) {
    return null;
  }

  const cursor = mainMap.getCanvas().style.cursor;

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
    if (hoveredStateId != feature.id) {
      unHoverFeature(layer);
    }

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

  if (mapStore.mapData) {
    for (const layer of mapStore.mapData.layers) {
      mainMap.on('mousemove', layer.id, e => {
        if (editorStore.isDrawing) {
          return;
        }

        if (e && e.features && e.features.length > 0) {
          let i = 0;
          let feature = e.features[i];

          while (!isPolygonWithBoundary(feature)) {
            i++;
            if (i >= e.features.length) {
              return;
            }
            feature = e.features[i];
          }

          hoverFeature(feature, layer);
          mainMap.getCanvas().style.cursor = 'pointer';
        }
      });

      mainMap.on('mouseleave', layer.id, () => {
        unHoverFeature(layer);
        mainMap.getCanvas().style.cursor = cursor;
      });
    }
  }

  return null;
});
