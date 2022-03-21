import { CategoryDto } from './dto/category.dto';
import { Category, CategoryDocument } from './entities/category.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFeatureDataDto } from './dto/create-feature.dto';
import { FeatureTypeDto } from './dto/feature-type.dto';
import { FeatureType, FeatureTypeDocument } from './entities/feature-type.entity';
import { MapFeature, MapFeatureDocument } from './entities/map-feature.entity';
import { AreaQuery } from './query/area.query';
import { Media } from './types/media';

@Injectable()
export class MapService {
  constructor(
    @InjectModel(MapFeature.name)
    private mapFeatureModel: Model<MapFeatureDocument>,
    @InjectModel(FeatureType.name)
    private featureTypeModel: Model<FeatureTypeDocument>,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Получение всех объектов на карте
   * @returns {Array<MapFeature>} - массив объектов
   */
  async getAllMapFeatures(areaQuery: AreaQuery): Promise<Array<MapFeature>> {
    // const filter = {
    //   'coordinates.lon': { $gte: areaQuery.lonL, $lte: areaQuery.lonR },
    //   'coordinates.lat': { $gte: areaQuery.latB, $lte: areaQuery.latT },
    // };

    // //      zoom: { $gte: areaQuery.zoom - 3, $lte: areaQuery.zoom + 3 },
    // return this.mapFeatureModel.find(filter);
    return this.mapFeatureModel.find();
  }

  /**
   * Добавление объекта в базу данных
   * @param {MapFeature} mapFeature - данные про объект на карте
   * @returns {MapFeature} - добавленный объект
   */
  async addMapFeature(mapFeatureDto: CreateFeatureDataDto, userId: string): Promise<MapFeature> {
    console.log(mapFeatureDto);

    const mapFeature = new this.mapFeatureModel({ ...mapFeatureDto, user: userId, createdAt: Date.now() });
    return (await mapFeature.save()).populate({ path: 'type' });
  }

  /**
   * Добавление медиа к объекту
   * @param {string} id - id объекта
   * @param {string[]} files - файлы
   */
  async addMapFeatureMedia(id: string, userId: string, files: string[]): Promise<Media[]> {
    console.log(files);

    const mediaFiles: Media[] = [];
    for (const file of files) {
      mediaFiles.push({ name: file, createdAt: Date.now(), createdBy: userId });
    }
    await this.mapFeatureModel.findOneAndUpdate({ _id: id }, { $push: { files: { $each: mediaFiles } } }, { new: true });
    return mediaFiles.map((file) => {
      file.name = `${process.env.DOMAIN}/api/map/feature/media/${file.name}`;
      return file;
    });
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  async getMapFeatureById(id: string): Promise<MapFeature> {
    return this.mapFeatureModel.findById(id);
  }

  /**
   * Получение всех типов объекта
   */
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return this.featureTypeModel.find();
  }

  /**
   * Создание нового типа объекта
   */
  async createFeatureType(dto: FeatureTypeDto): Promise<FeatureType> {
    const featureType = new this.featureTypeModel({ ...dto });
    return featureType.save();
  }

  /**
   * Получение всех категорий
   */
  async getCategories(): Promise<Array<Category>> {
    return this.categoryModel.find();
  }

  /**
   * Создание новой категории
   */
  async createCategory(dto: CategoryDto): Promise<Category> {
    const category = new this.categoryModel({ ...dto });
    return category.save();
  }

  /**
   * Получение последних добавленных объектов
   * @param amount - количество объектов для выборки
   * @returns {MapFeature} - последние amount добавленных объектов
   */
  async getNewestFeatures(amount: number): Promise<Array<MapFeature>> {
    return this.mapFeatureModel.find().sort({ _id: -1 }).limit(amount);
  }
}
