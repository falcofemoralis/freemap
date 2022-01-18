import { Body, Controller, Get, Post, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MapService } from './map.service';
import { MapObject } from './entities/mapobject.entity';
import { MapObjectDto } from 'shared/dto/map/mapobject.dto';
import { ObjectTypeDto } from 'shared/dto/map/objecttype.dto';
import { ObjectSubTypeDto } from 'shared/dto/map/objectsubtype.dto';
import { MapDataDto, MapFeatureDto, FeatureProperties } from 'shared/dto/map/mapdata.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDataDto } from 'shared/dto/auth/userdata.dto';
import { AuthService } from '../auth/auth.service';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { ObjectGuard } from './guards/object.guard';

const MEDIA_PATH = './uploads/media';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly authService: AuthService) {}

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
        links: obj.links ?? null,
        userId: obj.user.id,
      };

      features.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: obj.type.geometry,
          coordinates: JSON.parse(obj.coordinates) as number[][][],
        },
      });
    }

    const mapData: MapDataDto = {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:3857',
        },
      },
      features: features,
    };

    return mapData;
  }

  @UseGuards(JwtAuthGuard)
  @Post('object')
  async addMapObject(@Body() mapObjectDto: MapObjectDto, @Request() req): Promise<number> {
    const userDataDto: UserDataDto = req.user;

    const mapObject: MapObject = new MapObject();
    mapObject.name = mapObjectDto.name;
    mapObject.desc = mapObjectDto.desc;
    mapObject.coordinates = mapObjectDto.coordinates;
    mapObject.type = await this.mapService.getObjectTypeById(mapObjectDto.typeId);
    mapObject.subtype = await this.mapService.getObjectSubtypeById(mapObjectDto.subtypeId);
    mapObject.address = mapObjectDto.address;
    mapObject.links = mapObjectDto.links;
    mapObject.user = await this.authService.getUserById(userDataDto.id);

    const insertedObject = await this.mapService.addMapObject(mapObject);

    return insertedObject.id;
  }

  @UseGuards(JwtAuthGuard, ObjectGuard)
  @Post('object/:id/media/')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const path = Path.join(MEDIA_PATH, req.params.id);
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
          }

          cb(null, path);
        },
        filename: (req, file, cb) => {
          const fileName: string = v4() + Path.extname(file.originalname);

          cb(null, fileName);
        },
      }),
    }),
  )
  async addMapObjectMedia(@UploadedFiles() files: Array<Express.Multer.File>) {
  }

  @Get('object/types')
  async getObjectTypes(): Promise<Array<ObjectTypeDto>> {
    return await this.mapService.getAllObjectTypes();
  }

  @Get('object/subtypes')
  async getObjectSubTypes(): Promise<Array<ObjectSubTypeDto>> {
    return await this.mapService.getAllObjectSubTypes();
  }
}
