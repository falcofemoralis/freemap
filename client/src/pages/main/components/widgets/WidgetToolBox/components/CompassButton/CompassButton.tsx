import ExploreIcon from '@mui/icons-material/Explore';
import { IconButton } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import * as React from 'react';

interface CompassButtonProps {
  mainMap?: mapboxgl.Map;
}
export const CompassButton: React.FC<CompassButtonProps> = ({ mainMap }) => {
  const onCompassClick = () => {
    mainMap?.easeTo({ bearing: 0, pitch: 0 });
  };

  return (
    <IconButton onClick={onCompassClick}>
      <ExploreIcon />
    </IconButton>
  );
};
