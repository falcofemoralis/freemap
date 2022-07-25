import GpsFixedOutlinedIcon from '@mui/icons-material/GpsFixedOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import { IconButton } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import React, { useState } from 'react';

interface GeolocationButtonProps {
  geolocationControl: mapboxgl.GeolocateControl;
}
export const GeolocationButton: React.FC<GeolocationButtonProps> = ({ geolocationControl }) => {
  const [locationstart, setLocationstart] = useState(false);
  const [locationend, setLocationend] = useState(false);

  geolocationControl.on('trackuserlocationstart', () => {
    setLocationstart(true);
    setLocationend(false);
  });

  geolocationControl.on('trackuserlocationend', () => {
    setLocationstart(false);
    setLocationend(true);
  });

  const onGeolocateClick = () => {
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

  return <IconButton onClick={onGeolocateClick}>{getGpsIcon()}</IconButton>;
};
