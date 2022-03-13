import mapboxgl from 'mapbox-gl';
import React from 'react';

export interface IMapContext {
  mainMap?: mapboxgl.Map;
}

export const MapContext = React.createContext<Partial<IMapContext>>({});

export const MapProvider: React.FC<IMapContext> = ({ mainMap, children }) => {
  return <MapContext.Provider value={{ mainMap }}>{children}</MapContext.Provider>;
};
