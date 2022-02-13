import { AxiosError } from 'axios';
import { toJS } from 'mobx';
import { errorStore } from '../store/error.store';
import { IMapFeature } from '../types/IMapFeature';
import { IMapFeatureType } from '../types/IMapFeatureType';
import { axiosInstance, headers } from './index';

export default class MapService {
    private static API_URL = '/map';

    static async getFeatureTypes(): Promise<Array<IMapFeatureType>> {
        const { data } = await axiosInstance.get<Array<IMapFeatureType>>(`${this.API_URL}/feature/types`);
        return data;
    }

    static async getMapData(ext: number[], zoom: number) {
        const { data } = await axiosInstance.get(
            `${this.API_URL}?latT=${ext[3]}&lonR=${ext[2]}&latB=${ext[1]}&lonL=${ext[0]}&zoom=${zoom}`
        );
        return data;
    }

    static async addFeature(feature: IMapFeature): Promise<IMapFeature> {
        const body = { ...feature, type: feature.type.id, coordinates: toJS(feature.coordinates) };

        try {
            const { data } = await axiosInstance.post<IMapFeature>(`${this.API_URL}/feature`, body, { headers: headers() });
            return data;
        } catch (e: AxiosError | unknown) {
            errorStore.errorHandle(e);
            throw e;
        }
    }

    static async getMapFeature(id: string): Promise<IMapFeature> {
        try {
            const { data } = await axiosInstance.get<IMapFeature>(`${this.API_URL}/feature/${id}`);
            return data;
        } catch (e: AxiosError | unknown) {
            errorStore.errorHandle(e);
            throw e;
        }
    }
}
