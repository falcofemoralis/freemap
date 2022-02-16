import Map from 'ol/Map';
import React from 'react';

export interface IMapContext {
    map: Map;
}

export const MapContext = React.createContext<Partial<IMapContext>>({});

export const MapProvider: React.FC<IMapContext> = ({ map, children }) => {
    return <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>;
};
