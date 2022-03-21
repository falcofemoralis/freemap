import { Fade, IconButton, Paper, Popper, Typography } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { observer } from 'mobx-react-lite';
import React from 'react';
import MapConstant from '../../../../constants/map.constant';
import { MapContext } from '../../../../MapProvider';
import { Logger } from '../../../../misc/Logger';
import { mapStore } from '../../../../store/map.store';
import '../../styles/Widget.scss';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

export const WidgetPreviewBox = () => {
  Logger.info('WidgetPreviewBox');

  const { mainMap } = React.useContext(MapContext);
  const [previewMap, setPreviewMap] = React.useState<mapboxgl.Map>();
  const mapNode = React.useRef(null);

  React.useEffect(() => {
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

const PreviewMapLabel = observer(() => {
  return (
    <>{mapStore.mapType === MapConstant.GOOGLE ? <Typography variant='subtitle2'>Земля</Typography> : <Typography variant='subtitle2'>Карта</Typography>}</>
  );
});

const MapsDeck = () => {
  const [open, setOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      setAnchorEl(event.currentTarget);
      setOpen(true);
    } else {
      setAnchorEl(null);
      setOpen(false);
    }
  };

  return (
    <>
      <Popper open={open} anchorEl={anchorEl} placement='top' transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Typography sx={{ p: 2 }}>The content of the Popper.</Typography>
            </Paper>
          </Fade>
        )}
      </Popper>
      <Paper className='mapsDeckBox' elevation={5}>
        <IconButton sx={{ height: 30 }} onClick={handleClick}>
          <ArrowDropUpIcon />
        </IconButton>
      </Paper>
    </>
  );
};
