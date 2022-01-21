import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
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
import { EnteredMapFeatureDataDto } from 'shared/dto/map/enteredMapFeatureData.dto';
import { ObjectTypeDto } from 'shared/dto/map/objectType.dto';
import { GeometryTypeDto } from 'shared/dto/map/geometryType.dto';
import { MapDataDto, MapFeatureDto, MapFeaturePropertiesDto } from 'shared/dto/map/mapdata.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { MapObjectGuard } from './guards/mapObjectGuard';
import { UserDto } from 'shared/dto/auth/user.dto';


const MEDIA_PATH = './uploads/media';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly authService: AuthService) {}

  /**
   * Получение объектов на карте
   * @returns {MapDataDto} - пак данных
   */
  @Get()
  async getMapData(): Promise<MapDataDto> {
    const features = await this.getMapFeatures(await this.mapService.getAllObjects());

    return {
      type: 'FeatureCollection',
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:3857',
        },
      },
      features,
    };
  }

  /**
   * Добавление нового объекта в базу данных
   * @param dataDto - веденные данные пользователем про объект
   * @param req - запрос с объектом пользователя
   * @returns {MapFeatureDto} - объект карты
   */
  @UseGuards(JwtAuthGuard)
  @Post('object')
  async addMapObject(@Body() dataDto: EnteredMapFeatureDataDto, @Request() req): Promise<MapFeatureDto> {
    if (!dataDto.name || !dataDto.desc || !dataDto.typeId || !dataDto.coordinates || !dataDto.zoom) {
      throw new BadRequestException();
    }

    const mapObject: MapObject = new MapObject();
    mapObject.name = dataDto.name;
    mapObject.desc = dataDto.desc;
    mapObject.coordinates = dataDto.coordinates;
    mapObject.zoom = dataDto.zoom;
    mapObject.type = await this.mapService.getObjectTypeById(dataDto.typeId);
    mapObject.address = dataDto.address;
    mapObject.links = dataDto.links;
    mapObject.user = await this.authService.getUserById((req.user as UserDto).id);

    const insertedMapObject = await this.mapService.addMapObject(mapObject);

    return (await this.getMapFeatures([insertedMapObject]))[0];
  }

  /**
   * Добавление медиа файлов к указаному объекту
   * @param files - массив медиа файлов (фото или видео)
   * @returns {Array<String>} массив имен добавленых медиа файлов
   */
  @UseGuards(JwtAuthGuard, MapObjectGuard)
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
      fileFilter: (request, file, cb) => {
        if (!file.mimetype.includes('image') || !file.mimetype.includes('video')) {
          return cb(new BadRequestException('Provide a valid file'), false);
        }
        cb(null, true);
      },
    }),
  )
  async addMapObjectMedia(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Array<string>> {
    const insertedFileNames = new Array<string>();
    for (const file of files) {
      insertedFileNames.push(file.filename);
    }

    return insertedFileNames;
  }

  /**
   * Получение списка имен медиа файлов у объекта
   * @param id - id объекта
   */
  @Get('object/media/:id')
  getObjectMediaFiles(@Param('id') id): Array<string> {
    try {
      return fs.readdirSync(Path.join(process.cwd(), `${MEDIA_PATH}/${id}`));
    } catch (e) {
      throw new NotFoundException();
    }
  }

  /**
   * Получение медиа файла с сервера
   * @param id - id объекта
   * @param name - имя файла
   * @param res - ответ сервера
   */
  @Get('object/media/:id/:name')
  getMediaFile(@Param('id') id, @Param('name') name, @Res() res) {
    const path = Path.join(process.cwd(), `${MEDIA_PATH}/${id}/${name}`);

    try {
      if (fs.existsSync(path)) {
        res.sendFile(path);
      }
    } catch (e) {
      throw new NotFoundException();
    }
  }

  /**
   * Получение всех типов объекта
   */
  @Get('object/types')
  async getObjectTypes(): Promise<Array<ObjectTypeDto>> {
    return await this.mapService.getObjectTypes();
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа
   */
  @Get('object/type/:id')
  async getObjectTypeById(@Param('id') id: number): Promise<ObjectTypeDto> {
    return await this.mapService.getObjectTypeById(id);
  }

  /**
   * Получение геометрий объекта
   */
  @Get('object/geometries')
  async getGeometryTypes(): Promise<Array<GeometryTypeDto>> {
    return await this.mapService.getGeometryTypes();
  }

  /**
   * Получение геометрий объекта по id
   * @param id - id геометрии
   */
  @Get('object/geometry/:id')
  async getGeometryTypeById(@Param('id') id: number): Promise<GeometryTypeDto> {
    return await this.mapService.getGeometryTypeById(id);
  }

  /**
   * Получение типов объектов по id геотмерии
   * @param id - id геометрии
   */
  @Get('object/types/:id')
  async getObjectTypesByGeometryId(@Param('id') id: number): Promise<Array<ObjectTypeDto>> {
    return await this.mapService.getTypesByGeometryId(id);
  }

  /**
   * Получение списка последних добавленных объектов на карту
   * @param amount - количество объектов которые можно получить
   */
  @Get('object/newest/:amount')
  async getNewestObjects(@Param('amount') amount: number): Promise<Array<MapFeatureDto>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    return await this.getMapFeatures(await this.mapService.getNewestObjects(amount));
  }

  /**
   * Получение feature объектов карты
   * @param mapObjects - список объектов в базе данных
   * @returns {Array<MapFeatureDto>} - массив features
   */
  async getMapFeatures(mapObjects: Array<MapObject>): Promise<Array<MapFeatureDto>> {
    const features = new Array<MapFeatureDto>();

    for (const obj of mapObjects) {
      try {
        const featureProperties: MapFeaturePropertiesDto = {
          id: obj.id,
          userId: obj.user.id,
          typeId: obj.type.id,
          name: obj.name,
          desc: obj.desc,
          zoom: obj.zoom,
          date: obj.createdAt.toString(),
          address: obj.address ?? null,
          links: obj.links ?? null,
        };

        features.push({
          type: 'Feature',
          properties: featureProperties,
          geometry: {
            type: obj.type.geometryType.geometry,
            coordinates: JSON.parse(obj.coordinates) as number[][][],
          },
        });
      } catch (e) {
        console.log(e);
      }
    }

    return features;
  }
}
