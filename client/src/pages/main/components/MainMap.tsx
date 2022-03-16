import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { Logger } from '../../../misc/Logger';
import { mapStore } from '../../../store/map.store';
import { FeatureProps } from '../../../types/IMapData';

interface MainMapProps {
  onLoaded: (map: mapboxgl.Map) => void;
}
export const MainMap: React.FC<MainMapProps> = ({ onLoaded }) => {
  Logger.info('MainMap');

  const mapNode = React.useRef(null);
  let hoveredStateId: string | number | undefined | null = null;

  mapStore.parseUrlData(useLocation().search);

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
      center: [mapStore.lonLat[0], mapStore.lonLat[1]],
      zoom: mapStore.zoom
    });

    /**
     * Загрузка данных карты
     */
    mapboxMap.once('load', async () => {
      console.log('Инициализация главной карты окончена');

      onLoaded(mapboxMap);

      const mapData = await mapStore.initMapData(mapboxMap.getBounds().toArray());

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
            //mapboxMap.getCanvas().style.cursor = 'pointer';

            if (hoveredStateId) {
              mapboxMap.setFeatureState({ source: layer.source, id: hoveredStateId }, { hover: false });
            }

            hoveredStateId = e.features[0].id;
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

        /**
         * Листенер изменения координат. Меняется текущий url с добавлением координат и текущего приближения
         */
        mapboxMap?.on('moveend', () => {
          try {
            const zoom = mapboxMap.getZoom();
            const center = mapboxMap.getCenter();

            if (center && zoom) {
              mapStore.updateMapPosition(center.lng, center.lat, zoom);
            }
          } catch (e) {
            console.error(e);
          }
        });
      }
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
