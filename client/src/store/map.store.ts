import { Feature, FeatureCollection, Geometry, Position } from 'geojson';
import { Source } from 'mapbox-gl';
import { makeAutoObservable } from 'mobx';
import MapConstant from '../constants/map.constant';
import { getQueryParams, updateQuery } from '../misc/QueryManager';
import MapService from '../services/map.service';
import { FeatureProps, IMapData } from './../types/IMapData';

class MapStore {
  mapData: IMapData;
  mapType: MapConstant = MapConstant.OSM;
  lonLat: Position = [0, 0];
  zoom = 2;
  selectedFeatureId: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async initMapData(bounds: number[][]): Promise<IMapData> {
    this.mapData = await MapService.getMapData(bounds);
    return this.mapData;
  }

  async toggleMapType(): Promise<MapConstant> {
    if (mapStore.mapType == MapConstant.OSM) {
      mapStore.mapType = MapConstant.GOOGLE;
    } else {
      mapStore.mapType = MapConstant.OSM;
    }

    this.updateUrlData();

    return mapStore.mapType;
  }

  async setSelectedFeatureId(featureId: string | null) {
    this.selectedFeatureId = featureId;

    this.updateUrlData();
  }

  addFeature(sourceId: string, feature: Feature<Geometry, FeatureProps>): FeatureCollection<Geometry, FeatureProps> | null {
    const source = this.mapData.sources.find(source => source.id == sourceId);
    if (source) {
      source.featureCollection.features.push(feature);
      return source.featureCollection;
    }

    return null;
  }

  async updateMapPosition(lon: number, lat: number, zoom: number) {
    this.lonLat = [Number(lon.toFixed(5)), Number(lat.toFixed(5))];
    this.zoom = Number(zoom.toFixed(3));

    this.updateUrlData();
  }

  parseUrlData(url: string) {
    const query = getQueryParams(url);
    if (query.get('lon') && query.get('lat')) {
      this.lonLat = [parseFloat(query.get('lon')!.toString()), parseFloat(query.get('lat')!.toString())];
    }
    if (query.get('z')) this.zoom = parseFloat(query.get('z') as string);
    if (query.get('map')) this.mapType = MapConstant.getMapType(query.get('map') as string);
    if (query.get('selected')) this.selectedFeatureId = query.get('selected') as string;
  }

  updateUrlData() {
    updateQuery(this.lonLat, this.zoom, this.selectedFeatureId, this.mapType);
  }
}

export const mapStore = new MapStore();
