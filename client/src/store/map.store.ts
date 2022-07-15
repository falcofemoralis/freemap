import { Feature, FeatureCollection, Geometry } from 'geojson';
import { makeAutoObservable } from 'mobx';
import MapConstant from '../constants/map.constant';
import MapService from '../services/map.service';
import { HashUtil } from './../misc/HashUtil';
import { FeatureProps, IMapData } from './../types/IMapData';

class MapStore {
  mapData: IMapData;
  mapType: MapConstant = MapConstant.OSM;
  selectedFeatureId: string | null = null;

  constructor() {
    const data = HashUtil.getHashKey('data');
    data ? (this.mapType = MapConstant.getMapType(data)) : MapConstant.OSM;
    this.selectedFeatureId = HashUtil.getHashKey('selected');
    makeAutoObservable(this);
  }

  async initMapData(bounds: number[][], zoom: number, h: number, w: number): Promise<IMapData> {
    this.mapData = await MapService.getMapData(bounds);
    this.mapData.sources.push(await MapService.getWikimapiaData(bounds, zoom, h, w));
    return this.mapData;
  }

  async toggleMapType(): Promise<MapConstant> {
    if (mapStore.mapType == MapConstant.OSM) {
      mapStore.mapType = MapConstant.GOOGLE;
    } else {
      mapStore.mapType = MapConstant.OSM;
    }

    HashUtil.updateHash('data', MapConstant.getMapName(mapStore.mapType));
    return mapStore.mapType;
  }

  async setSelectedFeatureId(featureId: string | null) {
    this.selectedFeatureId = featureId;
    HashUtil.updateHash('selected', featureId);
  }

  addFeature(sourceId: string, feature: Feature<Geometry, FeatureProps>): FeatureCollection<Geometry, FeatureProps> | null {
    const source = this.mapData.sources.find(source => source.id == sourceId);
    if (source) {
      source.featureCollection.features.push(feature);
      return source.featureCollection;
    }

    return null;
  }
}

export const mapStore = new MapStore();
