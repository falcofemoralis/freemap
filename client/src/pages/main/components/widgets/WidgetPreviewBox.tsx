import { Paper, Typography } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { observer } from 'mobx-react-lite';
import React from 'react';
import MapConstant from '../../../../constants/map.constant';
import { MapContext } from '../../../../MapProvider';
import { mapStore } from '../../../../store/map.store';
import '../../styles/Widget.scss';

const PreviewMapLabel = observer(() => {
  return (
    <>{mapStore.mapType === MapConstant.GOOGLE ? <Typography variant='subtitle2'>Земля</Typography> : <Typography variant='subtitle2'>Карта</Typography>}</>
  );
});

export const WidgetPreviewBox = () => {
  const { mainMap } = React.useContext(MapContext);
  const [previewMap, setPreviewMap] = React.useState<mapboxgl.Map>();
  const mapNode = React.useRef(null);

  React.useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;

    const mapboxMap = new mapboxgl.Map({
      container: node,
      style: mapStore.mapType as string,
      center: [mapStore.lonLat[0], mapStore.lonLat[1]],
      zoom: mapStore.zoom
    });

    setPreviewMap(mapboxMap);

    return () => {
      mapboxMap.remove();
      setPreviewMap(undefined);
    };
  }, []);

  mainMap?.on('moveend', () => {
    previewMap?.setCenter(mainMap.getCenter());
    previewMap?.setZoom(mainMap.getZoom() - 4);
  });

  const changeMapType = async () => {
    const mapType = (await mapStore.toggleMapType()) as string;

    mainMap?.setStyle(mapType);
    previewMap?.setStyle(mapType);

    mainMap?.once('styledata', () => {
      for (const source of mapStore.mapData.sources) {
        mainMap?.addSource(source.id, {
          type: 'geojson',
          data: source.featureCollection
        });
      }

      for (const layer of mapStore.mapData.layers) {
        mainMap?.addLayer(layer as any);
      }
    });
  };

  return (
    <Paper className='previewMapBox' elevation={5} onClick={changeMapType}>
      <div ref={mapNode} className='previewMapBox__map' />
      <div className='previewMapBox__label'>
        <PreviewMapLabel />
      </div>
      <div className='previewMapBox__cover'></div>
      <div className='previewMapBox__plate'></div>
    </Paper>
  );
};
