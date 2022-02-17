import { Inject, Injectable } from '@nestjs/common';
import { AreaDto } from './dto/area.dto';
import { MapFeature, MapFeatureDocument } from './entities/map-feature.entity';
import { FeatureType, FeatureTypeDocument } from './entities/feature-type.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateFeatureDataDto } from './dto/create-feature.dto';
import { FeatureTypeDto } from './dto/feature-type.dto';
import { Dropbox, Error, files } from 'dropbox';

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
  async addMapFeature(mapFeatureDto: CreateFeatureDataDto, userId: string): Promise<MapFeature> {
    const mapFeature = new this.mapFeatureModel({ ...mapFeatureDto, user: userId, createdAt: Date.now() });
    return (await mapFeature.save()).populate({ path: 'type' });
  }

  /**
   * Добавление медиа к объекту
   * @param {string} id - id объекта
   * @param {string[]} files - файлы
   */
  async addMapFeatureMedia(id: string, files: string[]) {
    console.log(files);

    return this.mapFeatureModel.findOneAndUpdate({ _id: id }, { files }, { new: true });
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  async getMapFeatureById(id: string): Promise<MapFeature> {
    return this.mapFeatureModel.findById(id).populate([{ path: 'user' }, { path: 'type' }]);
  }

  /**
   * Получение всех типов объекта
   */
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return this.featureTypeModel.find();
  }

  /**
   * Создание нового типа объекта
   * @param featureType
   */
  async createFeatureType(dto: FeatureTypeDto): Promise<FeatureType> {
    const featureType = new this.featureTypeModel({ ...dto });
    return featureType.save();
  }

  // /**
  //  * Получение последних добавленных объектов
  //  * @param amount - количество объектов для выборки
  //  * @returns {MapFeature} - последние amount добавленных объектов
  //  */
  // async getNewestFeatures(amount: number): Promise<Array<MapFeature>> {
  //   return this.mapFeaturesRepository.find({ order: { id: 'DESC' }, take: amount });
  // }
}
