import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Feature } from 'geojson';
import { Model } from 'mongoose';
import { User } from '../auth/entities/user.entity';
import { UserComment } from '../comments/entities/user-comment';
import { CategoryDto } from './dto/category.dto';
import { CreateFeaturePropsDto } from './dto/create-feature.dto';
import { FeatureTypeDto } from './dto/feature-type.dto';
import { Category, CategoryDocument } from './entities/category.entity';
import { FeatureType, FeatureTypeDocument } from './entities/feature-type.entity';
import { MapFeature, MapFeatureDocument } from './entities/map-feature.entity';
import { AreaQuery } from './query/area.query';
import { GeometryProp } from './types/map-data';
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
    return this.mapFeatureModel.find().populate({
      path: 'properties',
      populate: [
        { path: 'type', model: FeatureType, select: 'id' },
        { path: 'category', model: Category, select: 'id' },
        { path: 'user', model: User, select: 'id' },
      ],
    });
  }

  /**
   * Добавление объекта в базу данных
   * @param {MapFeature} mapFeature - данные про объект на карте
   * @returns {MapFeature} - добавленный объект
   */
  async addMapFeature(mapFeatureDto: Feature<GeometryProp, CreateFeaturePropsDto>, userId: string): Promise<MapFeature> {
    const mapFeature = new this.mapFeatureModel({
      ...mapFeatureDto,
      properties: { ...mapFeatureDto.properties, user: userId, createdAt: Date.now() },
    });

    await mapFeature.save();
    return mapFeature.populate({
      path: 'properties',
      populate: [
        { path: 'type', model: 'FeatureType', select: 'id' },
        { path: 'category', model: 'Category', select: 'id' },
        { path: 'user', model: 'User', select: 'id' },
      ],
    });
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
    await this.mapFeatureModel.findOneAndUpdate({ _id: id }, { $push: { 'properties.files': { $each: mediaFiles } } }, { new: true });
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
    return this.mapFeatureModel.findById(id).populate({
      path: 'properties',
      populate: [
        { path: 'type', model: FeatureType, select: 'id' },
        { path: 'category', model: Category, select: 'id name icon' },
        { path: 'user', model: User, select: '-email -isMailing' },
        { path: 'comments', model: UserComment },
      ],
    });
  }

  /**
   * Получение всех слоев типа объекта
   */
  async getFeatureTypesLayers(): Promise<Array<FeatureType>> {
    return this.featureTypeModel.find();
  }

  /**
   * Получение всех типов объекта
   */
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return this.featureTypeModel.find().select('-layers');
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
    return this.mapFeatureModel
      .find()
      .sort({ _id: -1 })
      .limit(amount)
      .populate({
        path: 'properties',
        populate: [
          { path: 'type', model: FeatureType },
          { path: 'category', model: Category, select: 'id name icon' },
          { path: 'user', model: User, select: '-email -isMailing' },
        ],
      });
  }
}
