import { Feature, FeatureCollection } from 'geojson';
import { makeAutoObservable } from 'mobx';
import MapConstant from '../constants/map.constant';
import MapService from '../services/map.service';
import { HashUtil } from '../utils/HashUtil';
import { FeatureProps, GeometryProp, IMapData } from './../types/IMapData';
import { CreateFeatureProps } from '../types/IMapData';

class MapStore {
  mapData: IMapData;
  mapType: MapConstant = MapConstant.OSM;
  selectedFeatureId: string | null = null;
  performingUpdate = false;

  constructor() {
    const data = HashUtil.getHashKey('data');
    data ? (this.mapType = MapConstant.getMapType(data)) : MapConstant.OSM;
    this.selectedFeatureId = HashUtil.getHashKey('selected');
    makeAutoObservable(this);
  }

  async updateMapData(bounds: number[][], zoom: number, center: number[], h: number, w: number): Promise<IMapData | undefined> {
    if (this.performingUpdate) {
      return;
    }

    this.performingUpdate = true;
    this.mapData = await MapService.getMapData(bounds);
    //this.mapData.sources.push(await MapService.getWikimapiaData(center, zoom, h, w, TileTypes.OBJECTS));
    this.performingUpdate = false;

    return this.mapData;
  }

  toggleMapType(): MapConstant {
    if (mapStore.mapType == MapConstant.OSM) {
      mapStore.mapType = MapConstant.GOOGLE;
    } else {
      mapStore.mapType = MapConstant.OSM;
    }

    HashUtil.updateHash('data', MapConstant.getMapName(mapStore.mapType));
    return mapStore.mapType;
  }

  setSelectedFeatureId(featureId: string | null) {
    this.selectedFeatureId = featureId;
    HashUtil.updateHash('selected', featureId);
  }

  async addFeature(feature: Feature<GeometryProp, CreateFeatureProps>, files: File[]): Promise<FeatureCollection<GeometryProp, FeatureProps> | null> {
    const addedFeature = await MapService.addFeature(feature, files);
    const source = this.mapData.sources.find(source => source.id == addedFeature.properties.type.id);

    if (source) {
      source.featureCollection.features.push(addedFeature);
      return source.featureCollection;
    }

    return null;
  }
}

export const mapStore = new MapStore();
