import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { makeAutoObservable } from 'mobx';
import MapService from '../services/map.service';
import { ICreatedMapFeature } from '../types/IMapFeature';
import { IMapFeatureType } from '../types/IMapFeatureType';
class EditorStore {
  featureTypes: IMapFeatureType[] | null = null;
  createdFeature: Partial<ICreatedMapFeature> | null = null; // created feature
  isDrawing = false;

  constructor() {
    makeAutoObservable(this);
  }

  async getFeatureTypes() {
    this.featureTypes = await MapService.getFeatureTypes();
  }

  setFeature(feature: Partial<ICreatedMapFeature> | null) {
    this.createdFeature = feature;
  }

  toggleDrawing() {
    this.isDrawing = !this.isDrawing;
  }

  get isFeature() {
    return this.createdFeature != null;
  }
}

export const editorStore = new EditorStore();
