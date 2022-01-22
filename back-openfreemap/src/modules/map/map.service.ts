import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapObject } from './entities/mapobject.entity';
import { MoreThan, Repository } from 'typeorm';
import { GeometryType } from './entities/geometrytype.entity';
import { ObjectType } from './entities/objecttype.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(MapObject)
    private mapObjectRepository: Repository<MapObject>,
    @InjectRepository(GeometryType)
    private geometryTypeRepository: Repository<GeometryType>,
    @InjectRepository(ObjectType)
    private objectTypeRepository: Repository<ObjectType>,
  ) {
  }

  /**
   * Получение всех объетов на карте
   * @returns {Array<MapObject>} - массив объектов
   */
  getAllObjects(zoom: number): Promise<Array<MapObject>> {
    return this.mapObjectRepository.find({
      relations: ['type', 'user', 'type.geometryType'],
      where: { zoom: MoreThan(zoom) },
    });
  }

  /**
   * Добавление объекта в базу данных
   * @param mapObject - объект на карте
   * @returns {MapObject} - добавленный объект
   */
  addMapObject(mapObject: MapObject): Promise<MapObject> {
    return this.mapObjectRepository.save(mapObject);
  }

  findObjectById(id: number): Promise<MapObject> {
    return this.mapObjectRepository.findOne(id);
  }

  getObjectTypes(): Promise<Array<ObjectType>> {
    return this.objectTypeRepository.find();
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа объекта
   * @returns {ObjectType} - тип объекта
   */
  getObjectTypeById(id: number): Promise<ObjectType> {
    return this.objectTypeRepository.findOne(id);
  }

  getGeometryTypes(): Promise<Array<GeometryType>> {
    return this.geometryTypeRepository.find();
  }

  getGeometryTypeById(id: number): Promise<GeometryType> {
    return this.geometryTypeRepository.findOne(id);
  }

  getTypesByGeometryId(id: number): Promise<Array<ObjectType>> {
    return this.objectTypeRepository.find({ where: { geometryType: { id } } });
  }

  /**
   * Получение последних добавленных объектов
   * @param amount - количество объектов для выборки
   */
  getNewestObjects(amount: number): Promise<Array<MapObject>> {
    return this.mapObjectRepository.find({
      relations: ['type', 'user', 'type.geometryType'],
      order: {
        updatedAt: 'DESC',
      },
      take: amount,
    });
  }
}
