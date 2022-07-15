import booleanWithin from '@turf/boolean-within';
import { Polygon, Position } from 'geojson';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';
import { Logger } from '@/misc/Logger';
import { mapStore } from '@/store/map.store';
import { FeatureProps } from '@/types/IMapData';
import { GeometryType } from '@/constants/geometry.type';
import { GeoJSONSource } from 'mapbox-gl';
import MapService from '@/services/map.service';

interface MainMapProps {
  onLoaded: (map: mapboxgl.Map) => void;
}
export const MainMap: React.FC<MainMapProps> = ({ onLoaded }) => {
  Logger.info('MainMap');

  const mapNode = React.useRef(null);
  let hoveredStateId: string | number | undefined | null = null;

  React.useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;

    console.log('Инициализация главной карты');

    /**
     * Инициализация главной карты
     */
    mapboxgl.accessToken = process.env.REACT_APP_MAP_TOKEN ?? '';
    const mapboxMap = new mapboxgl.Map({
      container: node,
      style: mapStore.mapType as string,
      hash: 'map'
    });

    const isPolygonWithBoundary = (feature: mapboxgl.MapboxGeoJSONFeature) => {
      const bounds = mapboxMap?.getBounds();
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

      if (feature.geometry.type == GeometryType.POLYGON) {
        return booleanWithin(feature.geometry as Polygon, { type: 'Polygon', coordinates: [currentCoordinates] as Position[][] } as Polygon);
      } else {
        return true;
      }
    };

    /**
     * Загрузка данных карты
     */
    mapboxMap.once('load', async () => {
      console.log('Инициализация главной карты окончена');

      onLoaded(mapboxMap);

      const mapData = await mapStore.initMapData(
        mapboxMap.getBounds().toArray(),
        Number.parseInt(mapboxMap.getZoom().toFixed(0)),
        mapboxMap.getCanvas().height,
        mapboxMap.getCanvas().width
      );

      for (const source of mapData.sources) {
        mapboxMap.addSource(source.id, {
          type: 'geojson',
          data: source.featureCollection
        });
      }

      for (const layer of mapData.layers) {
        mapboxMap.addLayer(layer as mapboxgl.AnyLayer);

        if (layer.id.includes('label')) {
          continue;
        }

        mapboxMap.on('mousemove', layer.id, e => {
          if (e && e.features && e.features.length > 0) {
            const feature = e.features[0];

            if (!isPolygonWithBoundary(feature)) {
              if (hoveredStateId) {
                mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
                // hoveredStateId = null;
                // mapboxMap.getCanvas().style.cursor = 'auto';
              }

              return;
            }

            mapboxMap.getCanvas().style.cursor = 'pointer';

            if (hoveredStateId) {
              mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
            }

            hoveredStateId = feature.id;
            if (hoveredStateId) {
              mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: true });
            }
          }
        });

        mapboxMap.on('mouseleave', layer.id, () => {
          if (hoveredStateId) {
            mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
          }
          hoveredStateId = null;
        });

        mapboxMap.on('click', layer.id, e => {
          if (e && e.features && e.features.length > 0) {
            mapStore.setSelectedFeatureId((e.features[0].properties as FeatureProps).id);
          }
        });
      }
    });

    mapboxMap.on('dragend', async () => {
      console.log('A dragend event occurred.');
      const source = await MapService.getWikimapiaData(
        mapboxMap.getBounds().toArray(),
        Number.parseInt(mapboxMap.getZoom().toFixed(0)),
        mapboxMap.getCanvas().height,
        mapboxMap.getCanvas().width
      );

      (mapboxMap.getSource(source.id) as GeoJSONSource).setData(source.featureCollection);
    });

    mapboxMap.on('zoomend', () => {
      console.log('A zoomend event occurred.');
    });

    return () => {
      mapboxMap.remove();
    };
  }, []);

  return (
    <>
      <div ref={mapNode} className='map' />
    </>
  );
};
