import { MapContext } from '@/MapContext';
import { mapStore } from '@/store/map.store';
import { Paper } from '@mui/material';
import mapboxgl, { AnyLayer } from 'mapbox-gl';
import { useContext, useEffect, useRef, useState } from 'react';
import { PreviewMapLabel } from './components/PreviewMapLabel/PreviewMapLabel';
import './WidgetPreviewBox.scss';

export const WidgetPreviewBox = () => {
  const { mainMap } = useContext(MapContext);
  const [previewMap, setPreviewMap] = useState<mapboxgl.Map>();
  const mapNode = useRef(null);

  /**
   * Effect for preview mapboxgl initialization
   */
  useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;

    console.log('Инициализация превью карты');

    const previewMapboxMap = new mapboxgl.Map({
      container: node,
      style: mapStore.mapType as string,
      center: mainMap?.getCenter(),
      zoom: mainMap?.getZoom()
    });

    previewMapboxMap.once('load', () => {
      setPreviewMap(previewMapboxMap);
      console.log('Инициализация превью карты окончена');
    });

    return () => {
      previewMapboxMap.remove();
      setPreviewMap(undefined);
    };
  }, []);

  /**
   * Listen for main map position change and update position in preview map
   */
  mainMap?.on('moveend', () => {
    previewMap?.setCenter(mainMap.getCenter());
    previewMap?.setZoom(mainMap.getZoom() - 4);
  });

  /**
   * Change current type of preview map
   */
  const changeMapType = async () => {
    const mapType = (await mapStore.toggleMapType()) as string;

    mainMap?.setStyle(mapType);
    previewMap?.setStyle(mapType);

    // readd map features
    mainMap?.once('styledata', () => {
      for (const source of mapStore.mapData.sources) {
        mainMap?.addSource(source.id, {
          type: 'geojson',
          data: source.featureCollection
        });
      }

      for (const layer of mapStore.mapData.layers) {
        mainMap?.addLayer(layer as AnyLayer);
      }
    });
  };

  return (
    <>
      {/* <MapsDeck /> */}
      <Paper className='previewMapBox' elevation={5} onClick={changeMapType}>
        <div ref={mapNode} className='previewMapBox__map' />
        <div className='previewMapBox__label'>
          <PreviewMapLabel />
        </div>
        <div className='previewMapBox__cover'></div>
        <div className='previewMapBox__plate'></div>
      </Paper>
    </>
  );
};
