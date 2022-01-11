import { Body, Controller, Get, Post } from '@nestjs/common';
import { MapService } from './map.service';
import { MapData } from './entities/mapdata.entity';
import { MapDataDto } from 'shared/dto/map/mapdata.dto';
//import { ObjectType } from './entities/objectype.entity';
import { ObjectTypeDto } from 'shared/dto/map/objecttype.dto';
//import { ObjectSubtype } from './entities/objectsubtype.entity';
import { ObjectSubTypeDto } from 'shared/dto/map/objectsubtype.dto';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {
  }

  @Get()
  async getMapData(): Promise<any> {
    const data: MapData[] = await this.mapService.findAll();

    const features: Array<any> = new Array<any>();
    for (const obj of data) {
      features.push({
        type: 'Feature',
        properties: {
          name: obj.name
        },
        geometry: {
          type: obj.type.geometry,
          coordinates: JSON.parse(obj.coordinates)
        }
      });
    }

    return {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:3857'
        }
      },
      features: features
    };
  }

  @Post()
  async addMapData(@Body() mapDataDto: MapDataDto) {
    const mapData: MapData = new MapData();
    mapData.name = mapDataDto.name;
    mapData.coordinates = mapDataDto.coordinates;
    mapData.type = await this.mapService.getObjectTypeById(mapDataDto.typeId);
    mapData.subtype = await this.mapService.getObjectSubtypeById(mapDataDto.subtypeId);
    mapData.address = mapDataDto.address;
    mapData.links = mapDataDto.links;

    await this.mapService.create(mapData);
  }

  @Get('test')
  async getTest(): Promise<string> {
    return 'test';
  }

  @Get('getObjectTypes')
  async getObjectTypes(): Promise<Array<ObjectTypeDto>> {
    return  await this.mapService.getAllObjectTypes();
  }

  @Get('getObjectSubTypes')
  async getObjectSubTypes(): Promise<Array<ObjectSubTypeDto>> {
    return await this.mapService.getAllObjectSubTypes();
  }
}