import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MapData } from './entities/mapdata.entity';
import { Repository } from 'typeorm';
import { ObjectType } from './entities/objectype.entity';
import { ObjectSubtype } from './entities/objectsubtype.entity';

@Injectable()
export class MapService {
  constructor(
    @InjectRepository(MapData)
    private mapDataRepository: Repository<MapData>,
    @InjectRepository(ObjectType)
    private objectTypeRepository: Repository<ObjectType>,
    @InjectRepository(ObjectSubtype)
    private objectSubtypeRepository: Repository<ObjectSubtype>
  ) {
  }

  findAll(): Promise<MapData[]> {
    return this.mapDataRepository.find({ relations: ['type'] });
  }

  create(mapData: MapData): Promise<MapData> {
    return this.mapDataRepository.save(mapData);
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
