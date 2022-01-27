import { Injectable } from '@nestjs/common';
import { BboxDto } from '../../dto/map/bbox.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MapFeature } from './entities/map-feature.entity';
import { MongoRepository } from 'typeorm';
import { FeatureType } from './entities/feature-type.entity';
import { GeometryType } from './entities/geometry-type.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(MapFeature)
    private readonly mapFeaturesRepository: MongoRepository<MapFeature>,
    @InjectRepository(FeatureType)
    private readonly featureTypesRepository: MongoRepository<FeatureType>,
    @InjectRepository(GeometryType)
    private readonly geometryTypesRepository: MongoRepository<GeometryType>,
  ) {}

  /**
   * Получение всех объектов на карте
   * @returns {Array<MapFeature>} - массив объектов
   */
  async getAllMapFeatures(bbox: BboxDto): Promise<Array<MapFeature>> {
    const filter = {
      'coordinates.lon': { $gte: bbox.lonL, $lte: bbox.lonR },
      'coordinates.lat': { $gte: bbox.latB, $lte: bbox.latT },
      zoom: { $gte: bbox.zoom - 3, $lte: bbox.zoom + 3 },
    };

    return this.mapFeaturesRepository.find({ where: filter });
  }

  /**
   * Добавление объекта в базу данных
   * @param {MapFeature} mapFeature - данные про объект на карте
   * @returns {MapFeature} - добавленный объект
   */
  async addMapFeature(mapFeature: MapFeature): Promise<MapFeature> {
    return await this.mapFeaturesRepository.save(mapFeature);
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  async getMapFeatureById(id: string): Promise<MapFeature> {
    return this.mapFeaturesRepository.findOne(id);
  }

  //--------------

  /**
   * Получение всех типов объекта
   */
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return this.featureTypesRepository.find();
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа объекта
   * @returns {FeatureType} - тип объекта
   */
  async getFeatureTypeById(id: string): Promise<FeatureType> {
    return this.featureTypesRepository.findOne(id);
  }

  /**
   * Создание нового типа объекта
   * @param featureType
   */
  async createFeatureType(featureType: FeatureType): Promise<FeatureType> {
    return this.featureTypesRepository.save(featureType);
  }

  /**
   * Получение типов объектов по id геотмерии
   * @param id - id геометрии
   */
  async findFeatureTypesByGeometryId(id: string): Promise<Array<FeatureType>> {
    return this.featureTypesRepository.find({ where: { geometryTypeId: id } });
  }

  /**
   * Получение типа геометрии по id типа объекта
   * @param id - id геометрии
   */
  async getGeometryTypeByTypeId(id: string): Promise<GeometryType> {
    const featureType = await this.featureTypesRepository.findOne(id);
    return await this.geometryTypesRepository.findOne(featureType.geometryTypeId);
  }

  //--------------

  /**
   * Получение всех типов геометрии объекта
   */
  async getGeometryTypes(): Promise<Array<GeometryType>> {
    return this.geometryTypesRepository.find();
  }

  /**
   * Получение типа геометрии объекта по id
   * @param id - id типа геометрии
   */
  async getGeometryTypeByFeatureId(id: string): Promise<GeometryType> {
    return this.geometryTypesRepository.findOne(id);
  }

  //--------------

  /**
   * Получение последних добавленных объектов
   * @param amount - количество объектов для выборки
   * @returns {MapFeature} - последние amount добавленных объектов
   */
  async getNewestFeatures(amount: number): Promise<Array<MapFeature>> {
    return this.mapFeaturesRepository.find({ order: { id: 'DESC' }, take: amount });
  }
}
