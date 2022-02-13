import { Coordinate } from '../types/IMapFeature';
import { makeAutoObservable } from 'mobx';
import { IMapFeatureType } from '../types/IMapFeatureType';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

class EditorStore {
    isDrawing = false;
    coordinates: Coordinate[];
    zoom: number;
    selectedFeatureType: IMapFeatureType | null;
    newFeature: Feature<Geometry> | null = null; // объект геометрии на карте, который создается

    constructor() {
        makeAutoObservable(this);
    }

    toggleEdit() {
        this.isDrawing = !this.isDrawing;
    }
}

export const editorStore = new EditorStore();
