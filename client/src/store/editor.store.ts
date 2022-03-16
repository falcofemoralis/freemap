import { makeAutoObservable, runInAction } from 'mobx';
import { GeometryType } from '../constants/geometry.type';
import MapService from '../services/map.service';
import { ICategory } from '../types/ICategory';
import { ICreatedMapFeature } from '../types/IMapFeature';
import { IMapFeatureType } from '../types/IMapFeatureType';

class EditorStore {
  featureTypes: IMapFeatureType[] | null = null;
  categories: ICategory[] | null = null;
  createdFeature: Partial<ICreatedMapFeature> | null = null; // created feature
  isDrawing = false;
  selectedEditType: GeometryType | null = null;
  selectedFeatureType: IMapFeatureType | null = null;
  alert = false;

  constructor() {
    makeAutoObservable(this);
  }

  async getFeatureTypes() {
    const types = await MapService.getFeatureTypes();
    runInAction(() => {
      this.featureTypes = types;
    });
  }

  async getCategories() {
    const categories = await MapService.getCategories();
    runInAction(() => {
      this.categories = categories;
    });
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

  setSelectedEditType(type: GeometryType | null) {
    this.selectedEditType = type;
  }

  setSelectedFeatureType(type: IMapFeatureType | null) {
    this.selectedFeatureType = type;
  }

  toggleAlert() {
    this.alert = !this.alert;
  }
}

export const editorStore = new EditorStore();
