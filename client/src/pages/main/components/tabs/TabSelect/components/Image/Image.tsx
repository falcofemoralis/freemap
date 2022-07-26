import { CircularProgress } from '@mui/material';
import React from 'react';
import { useImageLoaded } from '../../hooks/useImageLoaded';
import './Image.scss';

interface ImageProps {
  className?: string;
  src: string;
}
export const Image: React.FC<ImageProps> = ({ className, src }) => {
  const [ref, loaded, onLoad] = useImageLoaded();

  return (
    <div>
      <img className={className} ref={ref} onLoad={onLoad} src={src} alt={src} style={{ display: loaded ? 'block' : 'none' }} />
      {!loaded && (
        <div className={`${className} image__progress`}>
          <CircularProgress />
        </div>
      )}
    </div>
  );
};
