import React, { FC } from 'react';
import Map from 'ol/Map';

export interface IMapContext {
    map: Map;
}

export const MapContext = React.createContext<Partial<IMapContext>>({});

export const MapProvider: FC<IMapContext> = ({ map, children }) => {
    return <MapContext.Provider value={{ map }}>{children}</MapContext.Provider>;
};
