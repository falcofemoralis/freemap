import { CreatedObject } from '@/types/CreatedObject';
import { axiosInstance, getAuthConfig } from '@/api/index';
import { CreateFeatureDataDto, FullFeatureDataDto, MapDataDto, MapFeatureDto, NewestFeatureDataDto, ShortFeatureDataDto } from '@/dto/map/map-data.dto';
import { GeometryTypeDto } from '@/dto/map/geometry-type.dto';
import { ObjectTypeDto } from '@/dto/map/object-type.dto';

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
  static async addMapObject(createdObject: CreatedObject): Promise<MapFeatureDto<ShortFeatureDataDto>> {
    const featurePropertiesDto: CreateFeatureDataDto = {
      name: createdObject.name,
      description: createdObject.description,
      coordinates: createdObject.coordinates,
      zoom: createdObject.zoom,
      typeId: createdObject.typeId,
      address: createdObject.address,
      links: [createdObject.links ?? ''],
    };

    const res = await axiosInstance.post('/map/object', featurePropertiesDto, { headers: { ...getAuthConfig() } });
    const mapFeatureDto: MapFeatureDto<ShortFeatureDataDto> = res.data;

    try {
      if (createdObject.mediaFiles && res.status == 201 && mapFeatureDto.properties.id) {
        await this.addMapObjectMedia(mapFeatureDto.properties.id, createdObject.mediaFiles);
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

  static async getMapObject(id: string): Promise<FullFeatureDataDto> {
    return (await axiosInstance.get<FullFeatureDataDto>(`/map/object/${id}`)).data;
  }

  /**
   * Добавление новых изображений к объекту
   * @param id - id объекта
   * @param files - массив загруженных файлов
   * @returns {Array<String>} - массив имен добавленных файлов
   */
  static async addMapObjectMedia(id: string, files: Blob[]): Promise<Array<string>> {
    const formData = new FormData();

    for (const file of files) {
      formData.append('files', file);
    }

    const res = await axiosInstance.post(`/map/object/media/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthConfig() } });

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
  static async getTypesByGeometry(geometryId: string): Promise<Array<ObjectTypeDto>> {
    return (await axiosInstance.get<Array<ObjectTypeDto>>(`/map/object/types/${geometryId}`)).data;
  }

  /**
   * Получение ссылки на медиа файл объекта
   * @param objId - id объекта
   * @param mediaName - название файла
   */
  static getMediaLink(objId: string, mediaName: string): string {
    return `${axiosInstance.defaults.baseURL}/map/object/media/${objId}/${mediaName}`;
  }

  /**
   * Получение последних добавленных объектов
   * @param amount - количество подгружаеемых объектов
   */
  static async getNewestObjects(amount: number): Promise<Array<MapFeatureDto<NewestFeatureDataDto>>> {
    return (await axiosInstance.get<Array<MapFeatureDto<NewestFeatureDataDto>>>(`/map/object/newest/${amount}`)).data;
  }
}
