import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapFeature, MapFeatureDocument } from './schemas/map-feature.schema';
import { ObjectType, ObjectTypeDocument } from './schemas/object-type.schema';
import { GeometryType, GeometryTypeDocument } from './schemas/geometry-type.schema';
import { CreateFeatureDataDto } from '../../dto/map/map-data.dto';
import { ObjectTypeDto } from '../../dto/map/object-type.dto';
import { BboxDto } from '../../dto/map/bbox.dto';

@Injectable()
export class MapService {
  constructor(
    @InjectModel(MapFeature.name)
    private mapFeatureModel: Model<MapFeatureDocument>,
    @InjectModel(ObjectType.name)
    private objectTypeModel: Model<ObjectTypeDocument>,
    @InjectModel(GeometryType.name)
    private geometryTypeModel: Model<GeometryTypeDocument>,
  ) {}

  /**
   * Получение всех объектов на карте
   * @returns {Array<MapFeatureDocument>} - массив объектов
   */
  async getAllObjects(bbox: BboxDto): Promise<Array<MapFeatureDocument>> {
    const filter = {
      'coordinates.lon': { $gte: bbox.lonL, $lte: bbox.lonR },
      'coordinates.lat': { $gte: bbox.latB, $lte: bbox.latT },
      zoom: { $gte: bbox.zoom - 3, $lte: bbox.zoom + 3 },
    };

    return this.mapFeatureModel.find(filter).populate({
      path: 'type',
      populate: {
        path: 'geometryType',
      },
    });
  }

  /**
   * Добавление объекта в базу данных
   * @param {FullFeatureDataDto} featurePropsDto - данные про объект на карте
   * @param userId - id пользователя, который добавил объект
   * @returns {MapFeatureDocument} - добавленный объект
   */
  async addMapObject(featurePropsDto: CreateFeatureDataDto, userId: string): Promise<MapFeatureDocument> {
    const newMapFeature = new this.mapFeatureModel({ user: userId, type: featurePropsDto.typeId, ...featurePropsDto });

    return (await newMapFeature.save()).populate([
      'type',
      {
        path: 'type',
        populate: {
          path: 'geometryType',
        },
      },
    ]);
  }

  /**
   * Получение объекта по его id
   * @param id - id объекта
   */
  async getObjectById(id: string): Promise<MapFeatureDocument> {
    return this.mapFeatureModel.findById(id).populate([
      'user',
      'type',
      {
        path: 'type',
        populate: {
          path: 'geometryType',
        },
      },
    ]);
  }

  //--------------

  /**
   * Получение всех типов объекта
   */
  async getObjectTypes(): Promise<Array<ObjectTypeDocument>> {
    return this.objectTypeModel.find().populate(['geometryType']);
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа объекта
   * @returns {ObjectTypeDocument} - тип объекта
   */
  async getObjectTypeById(id: string): Promise<ObjectTypeDocument> {
    return this.objectTypeModel.findById(id).populate(['geometryType']);
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

    return (await newObjectType.save()).populate(['geometryType']);
  }

  /**
   * Получение типов объектов по id геотмерии
   * @param id - id геометрии
   */
  async getTypesByGeometryId(id: string): Promise<Array<ObjectTypeDocument>> {
    return this.objectTypeModel.find({ geometryType: id }).populate(['geometryType']);
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
    return this.mapFeatureModel
      .find()
      .sort({ _id: -1 })
      .limit(amount)
      .populate([
        'user',
        {
          path: 'type',
          populate: {
            path: 'geometryType',
          },
        },
      ]);
  }
}
