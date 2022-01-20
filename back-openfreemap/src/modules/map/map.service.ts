import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapObject } from './entities/mapobject.entity';
import { Repository } from 'typeorm';
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

  findAll(): Promise<MapObject[]> {
    return this.mapObjectRepository.find({ relations: ['type', 'user', 'type.geometryType'] });
  }

  addMapObject(mapObject: MapObject): Promise<MapObject> {
    return this.mapObjectRepository.save(mapObject);
  }

  findObjectById(id: number): Promise<MapObject> {
    return this.mapObjectRepository.findOne(id);
  }

  getObjectTypes(): Promise<Array<ObjectType>> {
    return this.objectTypeRepository.find();
  }

  getObjectTypeById(id: number): Promise<ObjectType> {
    return this.objectTypeRepository.findOne(id);
  }

  getGeometryTypes(): Promise<Array<GeometryType>> {
    return this.geometryTypeRepository.find();
  }

  getGeometryTypeById(id: number): Promise<GeometryType> {
    return this.geometryTypeRepository.findOne(id);
  }

  getTypesByGeometry(id: number): Promise<Array<ObjectType>> {
    return this.objectTypeRepository.find({ where: { geometryType: { id } } });
  }

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
