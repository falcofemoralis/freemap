// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AxiosError } from 'axios';
import { toJS } from 'mobx';
import { FileType } from '../constants/file.type';
import { errorStore } from '../store/error.store';
import { ICategory } from '../types/ICategory';
import { IMapData } from '../types/IMapData';
import { ICreatedMapFeature, IMapFeature } from '../types/IMapFeature';
import { IMapFeatureType } from '../types/IMapFeatureType';
import { IMedia } from '../types/IMedia';
import { authStore } from './../store/auth.store';
import { axiosInstance, headers } from './index';
export default class MapService {
  private static API_URL = '/map';

  static async getFeatureTypes(): Promise<Array<IMapFeatureType>> {
    try {
      const { data } = await axiosInstance.get<Array<IMapFeatureType>>(`${this.API_URL}/feature/types`);
      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static async getCategories(): Promise<Array<ICategory>> {
    try {
      const { data } = await axiosInstance.get<Array<IMapFeatureType>>(`${this.API_URL}/feature/categories`);
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

  static async addFeature(feature: ICreatedMapFeature, files: File[]): Promise<IMapFeature> {
    const body = { ...feature, type: feature.type.id, category: feature.category?.id, coordinates: toJS(feature.coordinates) };

    try {
      const { data } = await axiosInstance.post<IMapFeature>(`${this.API_URL}/feature`, body, { headers: headers() });
      if (files.length > 0) {
        await this.addMedia(data.id, files);
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

  static async getMapFeature(id: string): Promise<IMapFeature> {
    try {
      const { data } = await axiosInstance.get<IMapFeature>(`${this.API_URL}/feature/${id}`);
      console.log(data);

      return data;
    } catch (e: AxiosError | unknown) {
      errorStore.errorHandle(e);
      throw e;
    }
  }

  static getMedia(media: string, fileType: FileType): string {
    if (!media) {
      return '';
    }
    return `${axiosInstance.defaults.baseURL}${MapService.API_URL}/feature/media/${media}${fileType == FileType.ORIGINAL ? '' : `?type=${fileType}`}`;
  }

  static async getNewestFeatures(amount: number): Promise<Array<IMapFeature>> {
    const { data } = await axiosInstance.get<Array<IMapFeature>>(`${this.API_URL}/newest/${amount}`);
    return data;
  }
}
