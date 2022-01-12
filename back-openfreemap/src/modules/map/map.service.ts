import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapObject } from './entities/mapobject.entity';
import { Repository } from 'typeorm';
import { ObjectType } from './entities/objectype.entity';
import { ObjectSubtype } from './entities/objectsubtype.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(MapObject)
    private mapObjectRepository: Repository<MapObject>,
    @InjectRepository(ObjectType)
    private objectTypeRepository: Repository<ObjectType>,
    @InjectRepository(ObjectSubtype)
    private objectSubtypeRepository: Repository<ObjectSubtype>
  ) {
  }

  findAll(): Promise<MapObject[]> {
    return this.mapObjectRepository.find({ relations: ['type'] });
  }

  create(mapObject: MapObject): Promise<MapObject> {
    return this.mapObjectRepository.save(mapObject);
  }

  getObjectTypeById(id: number): Promise<ObjectType> {
    return this.objectTypeRepository.findOne(id);
  }

  getObjectSubtypeById(id: number): Promise<ObjectSubtype> {
    return this.objectSubtypeRepository.findOne(id);
  }

  getAllObjectTypes(): Promise<Array<ObjectType>> {
    return this.objectTypeRepository.find();
  }

  getAllObjectSubTypes(): Promise<Array<ObjectSubtype>> {
    return this.objectSubtypeRepository.find();
  }
}
