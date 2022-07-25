import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { IconButton } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import React, { useState } from 'react';

interface FullscreenButtonProps {
  fullscreenControl: mapboxgl.FullscreenControl;
}

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({ fullscreenControl }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const onFullscreenClick = () => {
    (fullscreenControl as any)._onClickFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  return <IconButton onClick={onFullscreenClick}>{isFullscreen ? <FullscreenExitIcon color='primary' /> : <FullscreenIcon />}</IconButton>;
};
