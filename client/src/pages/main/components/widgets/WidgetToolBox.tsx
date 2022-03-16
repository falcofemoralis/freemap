import ExploreIcon from '@mui/icons-material/Explore';
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
import { Logger } from '../../../../misc/Logger';
import '../../styles/Widget.scss';

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
  Logger.info('FullscreenButton');

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const fullscreen = () => {
    (fullscreenControl as any)._onClickFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  return <IconButton onClick={fullscreen}>{isFullscreen ? <FullscreenExitIcon color='primary' /> : <FullscreenIcon />}</IconButton>;
};

interface CompassButtonProps {
  mainMap?: mapboxgl.Map;
}
const CompassButton: React.FC<CompassButtonProps> = ({ mainMap }) => {
  Logger.info('CompassButton');

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
  Logger.info('RulerButton');

  const [isMeasuring, setMeasuring] = React.useState(false);

  React.useEffect(() => {
    console.log('Add listener');

    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMeasuring) {
          rulerControl.measuringOff();
          setMeasuring(false);
          console.log('off');
        }
      }
    };

    window.addEventListener('keyup', listener);
    return () => {
      window.removeEventListener('keyup', listener);
    };
  });

  const measure = () => {
    if (rulerControl.isMeasuring) {
      rulerControl.measuringOff();
      setMeasuring(false);
    } else {
      rulerControl.measuringOn();
      setMeasuring(true);
    }
  };

  return (
    <IconButton onClick={measure}>
      <StraightenOutlinedIcon color={isMeasuring ? 'primary' : 'action'} />
    </IconButton>
  );
};

interface GeolocationButtonProps {
  geolocationControl: mapboxgl.GeolocateControl;
}
const GeolocationButton: React.FC<GeolocationButtonProps> = ({ geolocationControl }) => {
  Logger.info('GeolocationButton');

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
      return <GpsFixedOutlinedIcon color='primary' />;
    } else if (!locationstart && locationend) {
      return <GpsNotFixedIcon color='primary' />;
    } else {
      return <GpsOffIcon />;
    }
  };

  return <IconButton onClick={geolocate}>{getGpsIcon()}</IconButton>;
};
