import { CreatedObject } from '@/types/CreatedObject';
import { axiosInstance, getAuthConfig } from '@/api/index';
import { EnteredMapFeatureDataDto } from '../../../shared/dto/map/enteredMapFeatureData.dto';
import { ObjectTypeDto } from '../../../shared/dto/map/objectType.dto';
import { GeometryTypeDto } from '../../../shared/dto/map/geometryType.dto';
import { MapFeatureDto } from '../../../shared/dto/map/mapData.dto';

export class MapService {
  /**
   * Получение ссылки к данным на карте
   * @returns {string} - url запрос к данным на карте
   */
  static getMapDataUrl(): string {
    return axiosInstance.defaults.baseURL + '/map';
  }

  /**
   * Отправка нового объекта на сервер
   * @param createdObject - новый созданный объект
   * @returns {MapFeatureDto} - добавленный объект в базу
   */
  static async addMapObject(createdObject: CreatedObject): Promise<MapFeatureDto> {
    if (!createdObject.name || !createdObject.desc || !createdObject.coordinates || createdObject.typeId == -1 || createdObject.zoom == -1) {
      throw new Error('Существуют не все поля!');
    }

    const enteredMapFeatureDataDto: EnteredMapFeatureDataDto = {
      name: createdObject.name,
      desc: createdObject.desc,
      coordinates: createdObject.coordinates,
      zoom: createdObject.zoom,
      typeId: createdObject.typeId,
      address: createdObject.address,
      links: createdObject.links,
    };

    const res = await axiosInstance.post('/map/object', enteredMapFeatureDataDto, { headers: { ...getAuthConfig() } });
    const mapFeatureDto: MapFeatureDto = res.data;

    if (createdObject.mediaFiles && res.status == 201) {
      mapFeatureDto.properties.mediaNames = await this.addMapObjectMedia(mapFeatureDto.properties.id, createdObject.mediaFiles);
    }

    return mapFeatureDto;
  }

  /**
   * Добавление новых изображений к объекту
   * @param id - id объекта
   * @param files - массив загруженных файлов
   * @returns {Array<String>} - массив имен добавленных файлов
   */
  static async addMapObjectMedia(id: number, files: Blob[]): Promise<Array<string>> {
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
   * Получение типов объекта по его геометрии
   */
  static async getTypesByGeometry(geometryId: number): Promise<Array<ObjectTypeDto>> {
    return (await axiosInstance.get<Array<GeometryTypeDto>>(`/map/object/types/${geometryId}`)).data;
  }

  /**
   * Получение ссылки на медиа файл объекта
   * @param objId - id объекта
   * @param mediaName - название файла
   */
  static getMediaLink(objId: number, mediaName: string): string {
    return `${axiosInstance.defaults.baseURL}/map/object/media/${objId}/${mediaName}`;
  }

  /**
   * Получение списка медиа файлов объекта
   * @param objId - id объекта
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
  static async getNewestObjects(amount: number): Promise<Array<MapFeatureDto>> {
    return (await axiosInstance.get<Array<MapFeatureDto>>(`/map/object/newest/${amount}`)).data;
  }
}