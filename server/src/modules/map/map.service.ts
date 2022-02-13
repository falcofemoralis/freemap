import { Injectable } from '@nestjs/common';
import { AreaDto } from './dto/area.dto';
import { MapFeature, MapFeatureDocument } from './entities/map-feature.entity';
import { FeatureType, FeatureTypeDocument } from './entities/feature-type.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateFeatureDataDto } from './dto/create-feature.dto';
import { FeatureTypeDto } from './dto/feature-type.dto';

@Injectable()
export class MapService {
  constructor(
    @InjectModel(MapFeature.name)
    private mapFeatureModel: Model<MapFeatureDocument>,
    @InjectModel(FeatureType.name)
    private featureTypeModel: Model<FeatureTypeDocument>,
  ) {}

  /**
   * Получение всех объектов на карте
   * @returns {Array<MapFeature>} - массив объектов
   */
  async getAllMapFeatures(areaDto: AreaDto): Promise<Array<MapFeature>> {
    const filter = {
      'coordinates.lon': { $gte: areaDto.lonL, $lte: areaDto.lonR },
      'coordinates.lat': { $gte: areaDto.latB, $lte: areaDto.latT },
      zoom: { $gte: areaDto.zoom - 3, $lte: areaDto.zoom + 3 },
    };

    return this.mapFeatureModel.find(filter).populate({ path: 'type' });
  }

  /**
   * Добавление объекта в базу данных
   * @param {MapFeature} mapFeature - данные про объект на карте
   * @returns {MapFeature} - добавленный объект
   */
  async addMapFeature(mapFeatureDto: CreateFeatureDataDto, files: string[], userId: string): Promise<MapFeature> {
    const mapFeature = new this.mapFeatureModel({ ...mapFeatureDto, files, user: userId, createdAt: Date.now() });
    return (await mapFeature.save()).populate({ path: 'type' });
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  async getMapFeatureById(id: string): Promise<MapFeature> {
    return this.mapFeatureModel.findById(id).populate([{ path: 'user' }, { path: 'type' }]);
  }

  // //--------------

  /**
   * Получение всех типов объекта
   */
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return this.featureTypeModel.find();
  }

  // /**
  //  * Получение типа объекта по id
  //  * @param id - id типа объекта
  //  * @returns {FeatureType} - тип объекта
  //  */
  // async getFeatureTypeById(id: string): Promise<FeatureType> {
  //   return this.featureTypesRepository.findOne(id);
  // }

  /**
   * Создание нового типа объекта
   * @param featureType
   */
  async createFeatureType(dto: FeatureTypeDto): Promise<FeatureType> {
    const featureType = new this.featureTypeModel({ ...dto });
    return featureType.save();
  }

  // /**
  //  * Получение типов объектов по id геотмерии
  //  * @param id - id геометрии
  //  */
  // async findFeatureTypesByGeometryId(id: string): Promise<Array<FeatureType>> {
  //   return this.featureTypesRepository.find({ where: { geometryTypeId: id } });
  // }

  // /**
  //  * Получение типа геометрии по id типа объекта
  //  * @param id - id геометрии
  //  */
  // async getGeometryTypeByTypeId(id: string): Promise<GeometryType> {
  //   const featureType = await this.featureTypesRepository.findOne(id);
  //   return await this.geometryTypesRepository.findOne(featureType.geometryTypeId);
  // }

  // //--------------

  // /**
  //  * Получение всех типов геометрии объекта
  //  */
  // async getGeometryTypes(): Promise<Array<GeometryType>> {
  //   return this.geometryTypesRepository.find();
  // }

  // /**
  //  * Получение типа геометрии объекта по id
  //  * @param id - id типа геометрии
  //  */
  // async getGeometryTypeByFeatureId(id: string): Promise<GeometryType> {
  //   return this.geometryTypesRepository.findOne(id);
  // }

  // //--------------

  // /**
  //  * Получение последних добавленных объектов
  //  * @param amount - количество объектов для выборки
  //  * @returns {MapFeature} - последние amount добавленных объектов
  //  */
  // async getNewestFeatures(amount: number): Promise<Array<MapFeature>> {
  //   return this.mapFeaturesRepository.find({ order: { id: 'DESC' }, take: amount });
  // }
}
