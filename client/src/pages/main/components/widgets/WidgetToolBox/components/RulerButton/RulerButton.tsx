import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import { IconButton } from '@mui/material';
import { RulerControl } from 'mapbox-gl-controls';
import React, { useState, useEffect } from 'react';

interface RulerButtonProps {
  rulerControl: RulerControl;
}
export const RulerButton: React.FC<RulerButtonProps> = ({ rulerControl }) => {
  const [isMeasuring, setMeasuring] = useState(false);

  /**
   * Effect for cancel measure by key
   */
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMeasuring) {
          rulerControl.measuringOff();
          setMeasuring(false);
        }
      }
    };

    window.addEventListener('keyup', listener);
    return () => {
      window.removeEventListener('keyup', listener);
    };
  });

  const onMeasureClick = () => {
    if (rulerControl.isMeasuring) {
      rulerControl.measuringOff();
      setMeasuring(false);
    } else {
      rulerControl.measuringOn();
      setMeasuring(true);
    }
  };

  return (
    <IconButton onClick={onMeasureClick}>
      <StraightenOutlinedIcon color={isMeasuring ? 'primary' : 'action'} />
    </IconButton>
  );
};
