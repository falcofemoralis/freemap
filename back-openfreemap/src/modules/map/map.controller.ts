import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MapService } from './map.service';
import { MapObject } from './entities/mapobject.entity';
import { MapObjectDto } from 'shared/dto/map/mapobject.dto';
import { ObjectTypeDto } from 'shared/dto/map/objectTypeDto';
import { GeometryTypeDto } from 'shared/dto/map/geometryType';
import { FeatureProperties, MapDataDto, MapFeatureDto } from 'shared/dto/map/mapdata.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDataDto } from 'shared/dto/auth/userdata.dto';
import { AuthService } from '../auth/auth.service';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { ObjectGuard } from './guards/object.guard';
import { NewestObjectDto } from 'shared/dto/map/newestobject.dto';

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
        id: obj.id,
        name: obj.name,
        desc: obj.desc,
        typeId: obj.type.id,
        address: obj.address ?? null,
        zoom: obj.zoom,
        links: obj.links ?? null,
        userId: obj.user.id,
      };

      features.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: obj.type.geometryType.geometry,
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
  async addMapObject(@Body() mapObjectDto: MapObjectDto, @Request() req): Promise<FeatureProperties> {
    const userDataDto: UserDataDto = req.user;

    const mapObject: MapObject = new MapObject();
    mapObject.name = mapObjectDto.name;
    mapObject.desc = mapObjectDto.desc;
    mapObject.coordinates = mapObjectDto.coordinates;
    mapObject.zoom = mapObjectDto.zoom;
    mapObject.type = await this.mapService.getObjectTypeById(mapObjectDto.typeId);
    mapObject.address = mapObjectDto.address;
    mapObject.links = mapObjectDto.links;
    mapObject.user = await this.authService.getUserById(userDataDto.id);

    const insertedMapObject = await this.mapService.addMapObject(mapObject);

    delete mapObjectDto.coordinates;
    const featureProperties: FeatureProperties = {
      id: insertedMapObject.id,
      userId: userDataDto.id,
      ...mapObjectDto,
    };

    return featureProperties;
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
  async addMapObjectMedia(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Array<string>> {
    const insertedFileNames = new Array<string>();
    for (const file of files) {
      insertedFileNames.push(file.filename);
    }

    return insertedFileNames;
  }

  @Get('object/types')
  async getObjectTypes(): Promise<Array<ObjectTypeDto>> {
    return await this.mapService.getObjectTypes();
  }

  @Get('object/type/:id')
  async getObjectTypeById(@Param('id') id: number): Promise<ObjectTypeDto> {
    return await this.mapService.getObjectTypeById(id);
  }

  @Get('object/geometries')
  async getGeometryTypes(): Promise<Array<GeometryTypeDto>> {
    return await this.mapService.getGeometryTypes();
  }

  @Get('object/geometry/:id')
  async getGeometryTypeById(@Param('id') id: number): Promise<GeometryTypeDto> {
    return await this.mapService.getGeometryTypeById(id);
  }

  @Get('object/types/:id')
  async getObjectTypesByGeometry(@Param('id') id: number): Promise<Array<ObjectTypeDto>> {
    return await this.mapService.getTypesByGeometry(id);
  }

  @Get('object/media/:id/:name')
  getMediaFile(@Param('id') id, @Param('name') name, @Res() res) {
    res.sendFile(Path.join(process.cwd(), `${MEDIA_PATH}/${id}/${name}`));
  }

  @Get('object/media/:id')
  getObjectMediaFiles(@Param('id') id): Array<string> {
    try {
      return fs.readdirSync(Path.join(process.cwd(), `${MEDIA_PATH}/${id}`));
    } catch (e) {
      throw new NotFoundException();
    }
  }

  @Get('object/newest/:amount')
  async getNewestObjects(@Param('amount') amount: number): Promise<Array<NewestObjectDto>> {
    const features = new Array<NewestObjectDto>();
    const objects = await this.mapService.getNewestObjects(amount);

    for (const obj of objects) {
      features.push({
        id: obj.id,
        name: obj.name,
        desc: obj.desc,
        coordinates: obj.coordinates,
        zoom: obj.zoom,
        typeId: obj.type.id,
        address: obj.address ?? null,
        links: obj.links ?? null,
        userName: obj.user.login,
        date: obj.updatedAt.toString(),
      });
    }

    return features;
  }
}
