import { CreatedObject } from '@/types/CreatedObject';
import { axiosInstance, getAuthConfig } from '@/api/index';
import { EnteredMapFeatureDataDto } from '../../../shared/dto/map/enteredMapFeatureData.dto';
import { ObjecttypeDto } from '@/../../../shared/dto/map/ObjecttypeDto';
import { GeometryTypeDto } from '@/../../../shared/dto/map/geometryType';
import { MapFeaturePropertiesDto } from '@/../../../shared/dto/map/mapData.dto';
import { NewestObjectDto } from '@/../../../shared/dto/map/newestObject.dto';

export class MapService {
  /**
   * Получение ссылки к данным на карте
   */
  static getMapData(): string {
    return axiosInstance.defaults.baseURL + '/map';
  }

  /**
   * Добавление нового объекта
   * @param createdObject
   */
  static async addCreatedObject(createdObject: CreatedObject): Promise<MapFeaturePropertiesDto> {
    if (createdObject.name && createdObject.desc && createdObject.coordinates && createdObject.typeId) {
      const mapObjectDto: EnteredMapFeatureDataDto = {
        name: createdObject.name,
        desc: createdObject.desc,
        coordinates: JSON.stringify(createdObject.coordinates),
        zoom: createdObject.zoom,
        typeId: createdObject.typeId,
        address: createdObject.address,
        links: createdObject.links,
      };

      const res = await axiosInstance.post('/map/object', mapObjectDto, { headers: { ...getAuthConfig() } });
      const featureProperties: MapFeaturePropertiesDto = res.data;

      if (createdObject.mediaFiles && res.status == 201) {
        featureProperties.mediaNames = await this.addObjectMedia(featureProperties.id, createdObject.mediaFiles);
      }

      return featureProperties;
    } else {
      throw new Error('Существуют не все поля!');
    }
  }

  /**
   * Добавление новых изображений к объекту
   * @param id
   * @param files
   */
  static async addObjectMedia(id: number, files: Blob[]): Promise<Array<string>> {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    const res = await axiosInstance.post(`/map/object/${id}/media`, formData, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig() } });

    return res.data;
  }

  /**
   * Получение типов геометрии объекта
   */
  static async getGeometryTypes(): Promise<Array<GeometryTypeDto>> {
    return (await axiosInstance.get<Array<GeometryTypeDto>>('/map/object/geometries')).data;
  }

  /**
   * Получение типов обхекта по его геометрии
   */
  static async getTypesByGeometry(geometryId: number): Promise<Array<ObjecttypeDto>> {
    return (await axiosInstance.get<Array<GeometryTypeDto>>(`/map/object/types/${geometryId}`)).data;
  }

  /**
   * Получение ссылки на медиа файл объекта
   * @param objId
   * @param mediaName
   */
  static getMediaLink(objId: number, mediaName: string): string {
    return `${axiosInstance.defaults.baseURL}/map/object/media/${objId}/${mediaName}`;
  }

  /**
   * Получение списка медиа файлов объекта
   * @param objId
   */
  static async getObjectMedia(objId: number): Promise<Array<string>> {
    try {
      return (await axiosInstance.get<Array<string>>(`/map/object/media/${objId}`)).data;
    } catch (e) {
      return [];
    }
  }

  /**
   * Получение последних добавленных объектов
   * @param amount - количество подгружаеемых объектов
   */
  static async getNewestObjects(amount: number): Promise<Array<NewestObjectDto>> {
    return (await axiosInstance.get<Array<NewestObjectDto>>(`/map/object/newest/${amount}`)).data;
  }
}