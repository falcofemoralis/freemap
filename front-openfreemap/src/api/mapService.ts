import { CreatedObject } from '@/types/CreatedObject';
import { axiosInstance, getAuthConfig } from '@/api/index';
import { MapObjectDto } from '../../../shared/dto/map/mapobject.dto';
import { ObjectSubTypeDto } from '@/../../shared/dto/map/objectsubtype.dto';
import { ObjectTypeDto } from '@/../../shared/dto/map/objecttype.dto';
import store from '@/store/index';

export class MapService {
  static getMapUri(): string {
    return axiosInstance.defaults.baseURL + '/map';
  }

  static async postCreatedObject(createdObject: CreatedObject) {
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

      await axiosInstance.post('/map', mapObjectDto, { headers: { ...getAuthConfig() } });
    } else {
      throw new Error('Существуют не все поля!');
    }
  }

  static async getTypes(): Promise<Array<ObjectTypeDto>> {
    return (await axiosInstance.get<Array<ObjectTypeDto>>('/map/getObjectTypes')).data;
  }

  static async getSubTypes(): Promise<Array<ObjectSubTypeDto>> {
    return (await axiosInstance.get<Array<ObjectSubTypeDto>>('/map/getObjectSubTypes')).data;
  }
}