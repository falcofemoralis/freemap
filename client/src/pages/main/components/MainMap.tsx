import { GeometryType } from '@/constants/geometry.type';
import { Logger } from '@/misc/Logger';
import MapService from '@/services/map.service';
import { mapStore } from '@/store/map.store';
import { FeatureProps, Layer } from '@/types/IMapData';
import booleanWithin from '@turf/boolean-within';
import { Polygon, Position } from 'geojson';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';

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

    const hoverFeature = (feature: mapboxgl.MapboxGeoJSONFeature, layer: Layer) => {
      mapboxMap.getCanvas().style.cursor = 'pointer';

      if (hoveredStateId) {
        mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
      }

      hoveredStateId = feature.id;
      if (hoveredStateId) {
        mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: true });
      }
    };

    const update = async () => {
      const source = await MapService.getWikimapiaData(
        mapboxMap.getCenter().toArray(),
        Number.parseInt(mapboxMap.getZoom().toFixed(0)),
        mapboxMap.getCanvas().height,
        mapboxMap.getCanvas().width
      );

      (mapboxMap.getSource(source.id) as GeoJSONSource).setData(source.featureCollection);
    };

    /**
     * Загрузка данных карты
     */
    mapboxMap.once('load', async () => {
      console.log('Инициализация главной карты окончена');

      onLoaded(mapboxMap);

      const mapData = await mapStore.updateMapData(
        mapboxMap.getBounds().toArray(),
        Number.parseInt(mapboxMap.getZoom().toFixed(0)),
        mapboxMap.getCenter().toArray(),
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
            let i = 0;
            let feature = e.features[i];

            while (!isPolygonWithBoundary(feature)) {
              i++;
              if (i >= e.features.length) {
                return;
              }
              feature = e.features[i];
            }

            // if (!isPolygonWithBoundary(feature)) {
            //   // if (hoveredStateId) {
            //   //   mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
            //   //   // hoveredStateId = null;
            //   //   // mapboxMap.getCanvas().style.cursor = 'auto';
            //   // }

            //   return;
            // }

            hoverFeature(feature, layer);
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

    mapboxMap.on('dragstart', async () => {
      console.log('A dragend event occurred.');
      update();
    });

    mapboxMap.on('zoomstart', async () => {
      console.log('A zoomend event occurred.');
      update();
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
