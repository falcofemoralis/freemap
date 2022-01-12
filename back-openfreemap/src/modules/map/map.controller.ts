import { Body, Controller, Get, Post } from '@nestjs/common';
import { MapService } from './map.service';
import { MapObject } from './entities/mapobject.entity';
import { MapObjectDto } from 'shared/dto/map/mapobject.dto';
import { ObjectTypeDto } from 'shared/dto/map/objecttype.dto';
import { ObjectSubTypeDto } from 'shared/dto/map/objectsubtype.dto';
import {
  MapDataDto,
  MapFeatureDto,
  FeatureProperties
} from 'shared/dto/map/mapdata.dto';
import { map } from 'rxjs';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {
  }

  @Get()
  async getMapData(): Promise<any> {
    const mapObjects: MapObject[] = await this.mapService.findAll();

    const features: Array<MapFeatureDto> = new Array<any>();
    for (const obj of mapObjects) {
      const featureProperties: FeatureProperties = {
        name: obj.name,
        desc: obj.desc,
        typeId: obj.type.id,
        subtypeId: obj.subtype?.id ?? null,
        address: obj.address ?? null,
        links: obj.links ?? null
      };

      features.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: obj.type.geometry,
          coordinates: JSON.parse(obj.coordinates) as number[][][]
        }
      });
    }

    const mapData: MapDataDto = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:3857'
        }
      },
      features: features
    };

    return mapData;
  }

  @Post()
  async addMapObject(@Body() mapObjectDto: MapObjectDto) {
    const mapObject: MapObject = new MapObject();
    mapObject.name = mapObjectDto.name;
    mapObject.desc = mapObjectDto.desc;
    mapObject.coordinates = mapObjectDto.coordinates;
    mapObject.type = await this.mapService.getObjectTypeById(mapObjectDto.typeId);
    mapObject.subtype = await this.mapService.getObjectSubtypeById(mapObjectDto.subtypeId);
    mapObject.address = mapObjectDto.address;
    mapObject.links = mapObjectDto.links;

    await this.mapService.create(mapObject);
  }

  @Get('getObjectTypes')
  async getObjectTypes(): Promise<Array<ObjectTypeDto>> {
    return await this.mapService.getAllObjectTypes();
  }

  @Get('getObjectSubTypes')
  async getObjectSubTypes(): Promise<Array<ObjectSubTypeDto>> {
    return await this.mapService.getAllObjectSubTypes();
  }
}
