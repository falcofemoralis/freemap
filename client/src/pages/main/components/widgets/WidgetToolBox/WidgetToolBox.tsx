import { MapContext } from '@/MapContext';
import { Paper } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { RulerControl } from 'mapbox-gl-controls';
import { useContext } from 'react';
import { CompassButton } from './components/CompassButton/CompassButton';
import { FullscreenButton } from './components/FullscreenButton/FullscreenButton';
import { GeolocationButton } from './components/GeolocationButton/GeolocationButton';
import { RulerButton } from './components/RulerButton/RulerButton';
import './WidgetToolBox.scss';

export const WidgetToolBox = () => {
  const { mainMap } = useContext(MapContext);

  const geolocationControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  });
  mainMap?.addControl(geolocationControl);

  const rulerControl = new RulerControl();
  mainMap?.addControl(rulerControl);

  const fullscreenControl = new mapboxgl.FullscreenControl({ container: document.getElementById('main') });
  mainMap?.addControl(fullscreenControl);

  return (
    <>
      <Paper className='toolBox__compass'>
        <CompassButton mainMap={mainMap} />
      </Paper>
      <Paper className='toolBox__fullscreen'>
        <FullscreenButton fullscreenControl={fullscreenControl} />
      </Paper>
      <Paper className='toolBox__ruler'>
        <RulerButton rulerControl={rulerControl} />
      </Paper>
      <Paper className='toolBox__geolocation'>
        <GeolocationButton geolocationControl={geolocationControl} />
      </Paper>
    </>
  );
};
