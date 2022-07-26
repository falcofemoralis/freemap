import { mapStore } from '@/store/map.store';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect } from 'react';
import './MainMap.scss';

interface MainMapProps {
  onLoaded: (map: mapboxgl.Map) => void;
}
export const MainMap: React.FC<MainMapProps> = ({ onLoaded }) => {
  const mapNode = React.useRef(null);

  useEffect(() => {
    const node = mapNode.current;
    if (typeof window === 'undefined' || node === null) return;

    mapboxgl.accessToken = process.env.REACT_APP_MAP_TOKEN ?? '';
    const mapboxMap = new mapboxgl.Map({
      container: node,
      style: mapStore.mapType as string,
      hash: 'map'
    });

    mapboxMap.once('load', () => onLoaded(mapboxMap));

    return () => {
      mapboxMap.remove();
    };
  }, []);

  return <div ref={mapNode} className='map' />;
};
