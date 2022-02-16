import { IMapFeatureType } from './IMapFeatureType';

export interface Coordinate {
    lon: number;
    lat: number;
}

export interface IMapFeature {
    id: string;
    type: IMapFeatureType;
    coordinates: Coordinate[];
    zoom: number;
    name: string;
    description: string;
    address?: string;
    links?: string;
    files?: string[];
    createdAt: number;
}
