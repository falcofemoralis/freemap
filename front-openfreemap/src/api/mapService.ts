import { CreatedObject } from '@/types/CreatedObject';
import { axiosInstance, getAuthConfig } from '@/api/index';
import {
  FullFeatureDataDto,
  MapDataDto,
  MapFeatureDto,
  NewestFeatureDataDto,
  ShortFeatureDataDto
} from '@/dto/map/map-data.dto';
import { GeometryTypeDto } from '@/dto/map/geometry-type.dto';
import { FeatureTypeDto } from '@/dto/map/feature-type.dto';

export class MapService {
  /**
   * Получение ссылки к данным на карте
   * @returns {string} - url запрос к данным на карте
   */
  static async getMapData(ext: number[], zoom: number): Promise<MapDataDto<ShortFeatureDataDto>> {
    return (await axiosInstance.get<MapDataDto<ShortFeatureDataDto>>(`/map?latT=${ext[3]}&lonR=${ext[2]}&latB=${ext[1]}&lonL=${ext[0]}&zoom=${zoom}`)).data;
  }

  /**
   * Отправка нового объекта на сервер
   * @param createdObject - новый созданный объект
   * @returns {MapFeatureDto} - добавленный объект в базу
   */
  static async addMapFeature(createdObject: CreatedObject): Promise<MapFeatureDto<ShortFeatureDataDto>> {
    const { mediaFiles, ...featurePropertiesDto } = createdObject;
    const res = await axiosInstance.post('/map/feature', featurePropertiesDto, { headers: { ...getAuthConfig() } });
    const mapFeatureDto: MapFeatureDto<ShortFeatureDataDto> = res.data;

    try {
      if (createdObject.mediaFiles && res.status == 201 && mapFeatureDto.properties.id) {
        await this.addMapFeatureMedia(mapFeatureDto.properties.id, createdObject.mediaFiles);
      }

      return mapFeatureDto;
    } catch (e) {
      /*  if (axios.isAxiosError(e)) {
          if (e.response?.status) {
            throw new Error('');
          }
        }*/

      throw e;
    }
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  static async getMapFeature(id: string): Promise<MapFeatureDto<FullFeatureDataDto>> {
    return (await axiosInstance.get<MapFeatureDto<FullFeatureDataDto>>(`/map/feature/${id}`)).data;
  }

  /**
   * Добавление новых изображений к объекту
   * @param id - id объекта
   * @param files - массив загруженных файлов
   * @returns {Array<String>} - массив имен добавленных файлов
   */
  static async addMapFeatureMedia(id: string, files: Blob[]): Promise<Array<string>> {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    const res = await axiosInstance.post(`/map/feature/media/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig() } });

    return res.data;
  }

  /**
   * Получение типов геометрии объекта
   */
  static async getGeometryTypes(): Promise<Array<GeometryTypeDto>> {
    return (await axiosInstance.get<Array<GeometryTypeDto>>('/map/feature/geometries')).data;
  }

  /**
   * Получение типов объекта по его геометрии
   */
  static async getTypesByGeometry(geometryId: string): Promise<Array<FeatureTypeDto>> {
    return (await axiosInstance.get<Array<FeatureTypeDto>>(`/map/feature/types/${geometryId}`)).data;
  }

  /**
   * Получение ссылки на медиа файл объекта
   * @param id - id объекта
   * @param mediaName - название файла
   */
  static getMediaLink(id: string, mediaName: string): string {
    return `${axiosInstance.defaults.baseURL}/map/feature/media/${id}/${mediaName}`;
  }

  /**
   * Получение последних добавленных объектов
   * @param amount - количество подгружаеемых объектов
   */
  static async getNewestFeatures(amount: number): Promise<Array<MapFeatureDto<NewestFeatureDataDto>>> {
    return (await axiosInstance.get<Array<MapFeatureDto<NewestFeatureDataDto>>>(`/map/feature/newest/${amount}`)).data;
  }
}
