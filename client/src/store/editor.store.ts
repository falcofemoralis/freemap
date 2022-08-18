import { GeometryProp } from './../types/IMapData';
import { GeometryType } from '@/types/IMapData';
import { makeAutoObservable } from 'mobx';
import { IFeatureType } from '../types/IFeatureType';

class EditorStore {
  drawMode: GeometryType | null = null;
  selectedFeatureType: IFeatureType | null = null;
  createdGeometry: GeometryProp | null = null;
  isDrawing = false;
  alert = false;

  constructor() {
    makeAutoObservable(this);
  }

  setCreatedGeometry(geometry: GeometryProp | null) {
    this.createdGeometry = geometry;
  }

  toggleDrawing() {
    this.isDrawing = !this.isDrawing;
  }

  setDrawMode(type: GeometryType | null) {
    this.drawMode = type;
  }

  setSelectedFeatureType(type: IFeatureType | null) {
    this.selectedFeatureType = type;
  }

  toggleAlert() {
    this.alert = !this.alert;
  }
}

export const editorStore = new EditorStore();
