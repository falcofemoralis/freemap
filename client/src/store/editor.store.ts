import { makeAutoObservable } from 'mobx';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { GeometryType } from '../constants/geometry.type';
import { Coordinate } from '../types/IMapFeature';
import { IMapFeatureType } from '../types/IMapFeatureType';

class EditorStore {
    isDrawing = false;
    selectedEditType: GeometryType | null;
    selectedFeatureType: IMapFeatureType | null;
    isEditorTabOpen = false;

    newFeatureCoordinates: Coordinate[];
    newFeatureZoom: number;
    newFeature: Feature<Geometry> | null = null; // объект геометрии на карте, который создается

    constructor() {
        makeAutoObservable(this);
    }

    toggleEdit() {
        this.isDrawing = !this.isDrawing;
    }
}

export const editorStore = new EditorStore();
