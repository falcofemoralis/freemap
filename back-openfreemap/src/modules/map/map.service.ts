import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Coordinate, MapFeature, MapFeatureDocument } from './schemas/mapFeature.schema';
import { ObjectType, ObjectTypeDocument } from './schemas/objectType.schema';
import { GeometryType, GeometryTypeDocument } from './schemas/geometryType.schema';
import { ObjectTypeDto } from 'shared/dto/map/objectType.dto';
import { MapFeaturePropertiesDto } from 'shared/dto/map/mapdata.dto';

@Injectable()
export class MapService {
  constructor(
    @InjectModel(MapFeature.name)
    private mapFeatureModel: Model<MapFeature>,
    @InjectModel(ObjectType.name)
    private objectTypeModel: Model<ObjectType>,
    @InjectModel(GeometryType.name)
    private geometryTypeModel: Model<GeometryType>,
  ) {}

  /**
   * Получение всех объектов на карте
   * @returns {Array<MapFeatureDocument>} - массив объектов
   */
  async getAllObjects(latT: number, lonR: number, latB: number, lonL: number, zoom: number): Promise<Array<MapFeatureDocument>> {
    const filter = { 'coordinates.lon': { $gte: lonL as number, $lte: lonR as number }, 'coordinates.lat': { $gte: latB as number, $lte: latT as number } };
    console.log(filter);
    return this.mapFeatureModel.find(filter).populate(['user', 'type']);
  }

  /**
   * Добавление объекта в базу данных
   * @param featureData - данные про объект на карте
   * @returns {MapFeatureDocument} - добавленный объект
   */
  async addMapObject(featureData: MapFeaturePropertiesDto): Promise<MapFeatureDocument> {
    const coordinates: Coordinate[] = [];
    for (const coord of featureData.coordinates) {
      coordinates.push({ lon: coord[0], lat: coord[1] });
    }

    const newMapFeature = new this.mapFeatureModel({
      user: featureData.userId,
      name: featureData.name,
      description: featureData.description,
      type: featureData.typeId,
      zoom: featureData.zoom,
      coordinates: coordinates,
      address: featureData.address,
      links: featureData.links,
    });

    return (await newMapFeature.save()).populate(['user', 'type']);
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  async getObjectById(id: string): Promise<MapFeatureDocument> {
    return this.mapFeatureModel.findById(id).populate(['user', 'type']);
  }

  //--------------

  /**
   * Получение всех типов объекта
   */
  async getObjectTypes(): Promise<Array<ObjectTypeDocument>> {
    return this.objectTypeModel.find().populate('geometryType');
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа объекта
   * @returns {ObjectTypeDocument} - тип объекта
   */
  async getObjectTypeById(id: string): Promise<ObjectTypeDocument> {
    return this.objectTypeModel.findById(id).populate('geometryType');
  }

  /**
   * Создание нового типа объекта
   * @param objectTypeDto - объект типа
   */
  async createObjectType(objectTypeDto: ObjectTypeDto): Promise<ObjectTypeDocument> {
    const newObjectType = new this.objectTypeModel({
      name: objectTypeDto.name,
      geometryType: objectTypeDto.geometryId,
    });

    return (await newObjectType.save()).populate('geometryType');
  }

  /**
   * Получение типов объектов по id геотмерии
   * @param id - id геометрии
   */
  async getTypesByGeometryId(id: string): Promise<Array<ObjectTypeDocument>> {
    return this.objectTypeModel.find({ geometryType: id }).populate('geometryType');
  }

  //--------------

  /**
   * Получение всех типов геометрии объекта
   */
  async getGeometryTypes(): Promise<Array<GeometryTypeDocument>> {
    return this.geometryTypeModel.find().exec();
  }

  /**
   * Получение типа геометрии объекта по id
   * @param id - id типа геометрии
   */
  async getGeometryTypeById(id: string): Promise<GeometryTypeDocument> {
    return this.geometryTypeModel.findById(id);
  }

  //--------------

  /**
   * Получение последних добавленных объектов
   * @param amount - количество объектов для выборки
   * @returns {MapFeatureDocument} - последние amount добавленных объектов
   */
  async getNewestObjects(amount: number): Promise<Array<MapFeatureDocument>> {
    return this.mapFeatureModel.find().sort({ _id: -1 }).limit(amount).populate(['user', 'type']).exec();
  }
}
