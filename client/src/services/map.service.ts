import { TileTypes } from './../constants/tiles.type';
import { GeometryProp } from './../types/IMapData';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FeatureProps } from '@/types/IMapData';
import { AxiosError } from 'axios';
import { Feature, FeatureCollection } from 'geojson';
import { errorStore } from '../store/error.store';
import { ICategory } from '../types/ICategory';
import { IMapData, Source, CreateFeatureProps } from '../types/IMapData';
import { IFeatureType } from '../types/IFeatureType';
import { IMedia } from '../types/IMedia';
import { authStore } from './../store/auth.store';
import { axiosInstance, headers } from './index';

export default class MapService {
  private static API_URL = '/map';

  static async getFeatureTypes(): Promise<Array<IFeatureType>> {
    try {
      const { data } = await axiosInstance.get<Array<IFeatureType>>(`${this.API_URL}/feature/types`);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async getCategories(): Promise<Array<ICategory>> {
    try {
      const { data } = await axiosInstance.get<Array<IFeatureType>>(`${this.API_URL}/feature/categories`);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async getMapData(ext: number[][]): Promise<IMapData> {
    try {
      const { data } = await axiosInstance.get<IMapData>(`${this.API_URL}?latT=${ext[1][1]}&lonR=${ext[1][0]}&latB=${ext[0][1]}&lonL=${ext[0][0]}&zoom=${0}`);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async getWikimapiaData(center: number[], zoom: number, h: number, w: number, type: TileTypes): Promise<Source> {
    try {
      const { data } = await axiosInstance.get<Source>(
        `${this.API_URL}/wikimapia?lat=${center[1]}&lng=${center[0]}&zoom=${zoom + 1}&h=${h}&w=${w}&type=${type.toString()}`
      );

      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async addFeature(feature: Feature<GeometryProp, CreateFeatureProps>, files: File[]): Promise<Feature<GeometryProp, FeatureProps>> {
    try {
      const { data } = await axiosInstance.post<Feature<GeometryProp, FeatureProps>>(`${this.API_URL}/feature`, feature, { headers: headers() });
      if (files.length > 0 && data.properties.id) {
        await this.addMedia(data.properties.id, files);
      }
      authStore.updateUserLvl();

      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async addMedia(id: string, files: File[]): Promise<IMedia[]> {
    try {
      const filesFormData = new FormData();
      for (const file of files) {
        filesFormData.append('files', file);
      }
      const { data } = await axiosInstance.post(`${this.API_URL}/feature/${id}/media`, filesFormData, { headers: headers() });
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async getMapFeature(id: string): Promise<Feature<GeometryProp, FeatureProps>> {
    try {
      const { data } = await axiosInstance.get<Feature<GeometryProp, FeatureProps>>(`${this.API_URL}/feature/${id}`);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async getNewestFeatures(amount: number): Promise<Array<Feature<GeometryProp, FeatureProps>>> {
    const { data } = await axiosInstance.get<Array<Feature<GeometryProp, FeatureProps>>>(`${this.API_URL}/newest/${amount}`);
    return data;
  }

  static async analyzeFeature(feature: Feature<GeometryProp, CreateFeatureProps>): Promise<FeatureCollection<GeometryProp, FeatureProps>> {
    try {
      const { data } = await axiosInstance.post<FeatureCollection<GeometryProp, FeatureProps>>(`${this.API_URL}/feature/analyze`, feature, {
        headers: headers()
      });
      // authStore.updateUserLvl();

      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }
}
