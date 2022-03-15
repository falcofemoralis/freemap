import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import { IconButton, Paper } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { RulerControl } from 'mapbox-gl-controls';
import * as React from 'react';
import { MapContext } from '../../../../MapProvider';
import '../../styles/Widget.scss';
import ExploreIcon from '@mui/icons-material/Explore';
import { Logger } from '../../../../misc/Logger';

export const WidgetToolBox = () => {
  Logger.info('WidgetToolBox');

  const { mainMap } = React.useContext(MapContext);

  const geolocationControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    // When active the map will receive updates to the device's location as it changes.
    trackUserLocation: true,
    // Draw an arrow next to the location dot to indicate which direction the device is heading.
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

interface FullscreenButtonProps {
  fullscreenControl: mapboxgl.FullscreenControl;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ fullscreenControl }) => {
  console.log('FullscreenButton');

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const fullscreen = () => {
    (fullscreenControl as any)._onClickFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  return <IconButton onClick={fullscreen}>{isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}</IconButton>;
};

interface CompassButtonProps {
  mainMap?: mapboxgl.Map;
}
const CompassButton: React.FC<CompassButtonProps> = ({ mainMap }) => {
  console.log('CompassButton');

  const compass = () => {
    mainMap?.easeTo({ bearing: 0, pitch: 0 });
  };

  return (
    <IconButton onClick={compass}>
      <ExploreIcon />
    </IconButton>
  );
};

interface RulerButtonProps {
  rulerControl: RulerControl;
}
const RulerButton: React.FC<RulerButtonProps> = ({ rulerControl }) => {
  console.log('RulerButton');

  const measure = () => {
    if (rulerControl.isMeasuring) {
      rulerControl.measuringOff();
    } else {
      rulerControl.measuringOn();
    }
  };

  window.addEventListener('keyup', event => {
    if (event.key === 'Escape') {
      if (rulerControl.isMeasuring) {
        rulerControl.measuringOff();
      }
    }
  });

  return (
    <IconButton onClick={measure}>
      <StraightenOutlinedIcon />
    </IconButton>
  );
};

interface GeolocationButtonProps {
  geolocationControl: mapboxgl.GeolocateControl;
}
const GeolocationButton: React.FC<GeolocationButtonProps> = ({ geolocationControl }) => {
  console.log('GeolocationButton');

  const [locationstart, setLocationstart] = React.useState(false);
  const [locationend, setLocationend] = React.useState(false);

  geolocationControl.on('trackuserlocationstart', () => {
    setLocationstart(true);
    setLocationend(false);
  });

  geolocationControl.on('trackuserlocationend', () => {
    setLocationstart(false);
    setLocationend(true);
  });

  const geolocate = () => {
    geolocationControl?.trigger();

    if (locationstart) {
      setLocationstart(false);
      setLocationend(false);
    }
  };

  const getGpsIcon = () => {
    if (!locationstart && !locationend) {
      return <GpsOffIcon />;
    } else if (locationstart && !locationend) {
      return <GpsFixedOutlinedIcon />;
    } else if (!locationstart && locationend) {
      return <GpsNotFixedIcon />;
    } else {
      return <GpsOffIcon />;
    }
  };

  return <IconButton onClick={geolocate}>{getGpsIcon()}</IconButton>;
};
