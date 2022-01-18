import { CreatedObject } from '@/types/CreatedObject';
import { axiosInstance, getAuthConfig } from '@/api/index';
import { MapObjectDto } from '../../../shared/dto/map/mapobject.dto';
import { ObjectSubTypeDto } from '@/../../shared/dto/map/objectsubtype.dto';
import { ObjectTypeDto } from '@/../../shared/dto/map/objecttype.dto';
import { FeatureProperties } from '@/../../shared/dto/map/mapdata.dto';

export class MapService {
  static getMapData(): string {
    return axiosInstance.defaults.baseURL + '/map';
  }

  static async addCreatedObject(createdObject: CreatedObject): Promise<FeatureProperties> {
    if (createdObject.name && createdObject.desc && createdObject.coordinates && createdObject.typeId) {
      const mapObjectDto: MapObjectDto = {
        name: createdObject.name,
        desc: createdObject.desc,
        coordinates: JSON.stringify(createdObject.coordinates),
        typeId: createdObject.typeId,
        subtypeId: createdObject.subtypeId,
        address: createdObject.address,
        links: createdObject.links,
      };

      const res = await axiosInstance.post('/map/object', mapObjectDto, { headers: { ...getAuthConfig() } });
      const featureProperties: FeatureProperties = res.data;

      if (createdObject.mediaFiles && res.status == 201) {
        featureProperties.mediaNames = await this.addObjectMedia(featureProperties.id, createdObject.mediaFiles);
      }

      return featureProperties;
    } else {
      throw new Error('Существуют не все поля!');
    }
  }

  static async addObjectMedia(id: number, files: Blob[]): Promise<Array<string>> {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    const res = await axiosInstance.post(`/map/object/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig() } });

    return res.data;
  }

  static async getTypes(): Promise<Array<ObjectTypeDto>> {
    return (await axiosInstance.get<Array<ObjectTypeDto>>('/map/object/types')).data;
  }

  static async getSubTypes(): Promise<Array<ObjectSubTypeDto>> {
    return (await axiosInstance.get<Array<ObjectSubTypeDto>>('/map/object/subtypes')).data;
  }

  static getMediaLink(objId: number, mediaName: string): string {
    return `${axiosInstance.defaults.baseURL}/map/object/media/${objId}/${mediaName}`;
  }

  static async getObjectMedia(objId: number): Promise<Array<string>> {
    try {
      return (await axiosInstance.get<Array<string>>(`/map/object/media/${objId}`)).data;
    } catch (e) {
      return [];
    }
  }
}