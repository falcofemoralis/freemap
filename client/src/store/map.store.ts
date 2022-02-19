import { IMapFeatureType } from './../types/IMapFeatureType';
import { IMapFeature } from './../types/IMapFeature';
import { makeAutoObservable } from 'mobx';
import { fromLonLat } from 'ol/proj';
import MapConstant from '../constants/map.constant';
import { Coordinate } from '../types/IMapFeature';
import { getQueryParams, updateQuery } from '../utils/QueryUtil';
import MapService from '../services/map.service';

class MapStore {
    mapType: MapConstant = MapConstant.OSM;
    lonLat: Coordinate = { lon: 0, lat: 0 };
    zoom = 2;
    selectedFeatureId: string | null = null;
    featureTypes: IMapFeatureType[] = [];

    constructor() {
        makeAutoObservable(this);
        MapService.getFeatureTypes().then(types => {
            this.featureTypes = types;
        });
    }

    async toggleMapType(): Promise<MapConstant> {
        if (mapStore.mapType == MapConstant.OSM) {
            mapStore.mapType = MapConstant.GOOGLE;
        } else {
            mapStore.mapType = MapConstant.OSM;
        }

        this.updateUrl();

        return mapStore.mapType;
    }

    async setSelectedFeatureId(featureId: string | null) {
        this.selectedFeatureId = featureId;

        this.updateUrl();
    }

    async updateMapPosition(lonLat: Coordinate, zoom: number) {
        this.lonLat = lonLat;
        this.zoom = zoom;

        this.updateUrl();
    }

    parseUrl(url: string) {
        const query = getQueryParams(url);
        if (query.get('lon') && query.get('lat')) {
            const lonLat = fromLonLat([parseFloat(query.get('lon')!.toString()), parseFloat(query.get('lat')!.toString())], 'EPSG:3857');
            this.lonLat = { lon: lonLat[0], lat: lonLat[1] };
        }
        if (query.get('z')) this.zoom = parseFloat(query.get('z') as string);
        if (query.get('map')) this.mapType = MapConstant.getMapType(query.get('map') as string);
        if (query.get('selected')) this.selectedFeatureId = query.get('selected') as string;
    }

    updateUrl() {
        updateQuery(this.lonLat, this.zoom, this.selectedFeatureId, this.mapType);
    }
}

export const mapStore = new MapStore();
