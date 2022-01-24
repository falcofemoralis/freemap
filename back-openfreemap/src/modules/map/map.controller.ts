import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Query, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MapService } from './map.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { MapObjectGuard } from './guards/mapObjectGuard';
import { GetMapDataQuery } from './queries/getMapData.query';
import { FullFeaturePropertiesDto, MapDataDto, MapFeatureDto, NewestMapFeatureDto, ShortFeaturePropertiesDto } from '../../dto/map/mapData.dto';
import { UserDto } from '../../dto/auth/user.dto';
import { ObjectTypeDto } from '../../dto/map/objectType.dto';
import { GeometryTypeDto } from '../../dto/map/geometryType.dto';

const MEDIA_PATH = './uploads/media';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Получение объектов на карте
   * @param {GetMapDataQuery} bbox - область поиска объектов на карте
   * @returns {MapDataDto} - пак данных с объектами на карте
   */
  @Get()
  async getMapData(@Query() bbox: GetMapDataQuery): Promise<MapDataDto> {
    const mapObjects = await this.mapService.getAllObjects(bbox);

    const features = new Array<MapFeatureDto>();

    for (const obj of mapObjects) {
      const featureProperties: ShortFeaturePropertiesDto = {
        id: obj.id,
        typeId: obj.type.id,
        name: obj.name,
        date: obj._id.getTimestamp(),
      };

      const featureCoordinates: number[][] = [];
      for (const coordinate of obj.coordinates) {
        featureCoordinates.push([coordinate.lon, coordinate.lat]);
      }

      features.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: obj.type?.geometryType?.geometry,
          coordinates: [featureCoordinates],
        },
      });
    }

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
   * @param {FullFeaturePropertiesDto} featureDto - веденные данные пользователем про объект
   * @param req - запрос с объектом пользователя
   * @returns {MapFeatureDto} - объект карты
   */
  @UseGuards(JwtAuthGuard)
  @Post('object')
  async addMapObject(@Body() featureDto: FullFeaturePropertiesDto, @Request() req): Promise<MapFeatureDto> {
    const userId = (req.user as UserDto).id;
    const insertedMapObject = await this.mapService.addMapObject(featureDto, userId);

    featureDto.id = insertedMapObject.id;
    featureDto.userId = userId;
    featureDto.date = insertedMapObject._id.getTimestamp();

    const featureCoordinates: number[][] = [];
    for (const coordinate of featureDto.coordinates) {
      featureCoordinates.push([coordinate.lon, coordinate.lat]);
    }

    return {
      type: 'Feature',
      properties: featureDto,
      geometry: {
        type: insertedMapObject.type?.geometryType?.geometry,
        coordinates: [featureCoordinates],
      },
    };
  }

  /**
   * Добавление медиа файлов к указаному объекту
   * @param files - массив медиа файлов (фото или видео)
   * @returns {Array<String>} массив имен добавленых медиа файлов
   */
  @UseGuards(JwtAuthGuard, MapObjectGuard)
  @Post('object/media/:id')
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
        if (!file.mimetype.includes('image') && !file.mimetype.includes('video')) {
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
   * @returns {Array<String>} - массив имен файлов медиа
   */
  @Get('object/media/:id')
  getObjectMediaFiles(@Param('id') id: string): Array<string> {
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
  getMediaFile(@Param('id') id: string, @Param('name') name: string, @Res() res) {
    const path = Path.join(process.cwd(), `${MEDIA_PATH}/${id}/${name}`);

    try {
      if (fs.existsSync(path)) {
        res.sendFile(path);
      }
    } catch (e) {
      throw new NotFoundException();
    }
  }

  //--------------

  /**
   * Добавление нового типа объекта
   * @param {ObjectTypeDto} objectTypeDto - новый тип объекта
   */
  @UseGuards(JwtAuthGuard)
  @Post('object/type')
  async createObjectType(@Body() objectTypeDto: ObjectTypeDto): Promise<ObjectTypeDto> {
    const insertedObjectType = await this.mapService.createObjectType(objectTypeDto);

    return {
      id: insertedObjectType.id,
      geometryId: insertedObjectType.geometryType.id,
      name: insertedObjectType.name,
    };
  }

  /**
   * Получение всех типов объекта
   */
  @Get('object/types')
  async getObjectTypes(): Promise<Array<ObjectTypeDto>> {
    const types = await this.mapService.getObjectTypes();

    const typesDto = new Array<ObjectTypeDto>();
    for (const type of types) {
      typesDto.push({
        id: type.id,
        geometryId: type.geometryType.id,
        name: type.name,
      });
    }

    return typesDto;
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа
   */
  @Get('object/type/:id')
  async getObjectTypeById(@Param('id') id: string): Promise<ObjectTypeDto> {
    const type = await this.mapService.getObjectTypeById(id);

    return {
      id: type.id,
      geometryId: type.geometryType.id,
      name: type.name,
    };
  }

  /**
   * Получение типов объектов по id геометрии
   * @param id - id геометрии
   */
  @Get('object/types/:id')
  async getObjectTypesByGeometryId(@Param('id') id: string): Promise<Array<ObjectTypeDto>> {
    const types = await this.mapService.getTypesByGeometryId(id);

    const typesDto = new Array<ObjectTypeDto>();
    for (const type of types) {
      typesDto.push({
        id: type.id,
        geometryId: type.geometryType.id,
        name: type.name,
      });
    }

    return typesDto;
  }

  //--------------

  /**
   * Получение геометрий объекта
   */
  @Get('object/geometries')
  async getGeometryTypes(): Promise<Array<GeometryTypeDto>> {
    const types = await this.mapService.getGeometryTypes();

    const typesDto = new Array<GeometryTypeDto>();
    for (const type of types) {
      typesDto.push({
        id: type.id,
        name: type.name,
        geometry: type.geometry,
        key: type.key,
      });
    }

    return typesDto;
  }

  /**
   * Получение геометрий объекта по id
   * @param id - id геометрии
   */
  @Get('object/geometry/:id')
  async getGeometryTypeById(@Param('id') id: string): Promise<GeometryTypeDto> {
    const type = await this.mapService.getGeometryTypeById(id);

    return {
      id: type.id,
      name: type.name,
      key: type.key,
      geometry: type.geometry,
    };
  }

  //--------------

  /**
   * Получение списка последних добавленных объектов на карту
   * @param amount - количество объектов которые можно получить
   */
  @Get('object/newest/:amount')
  async getNewestObjects(@Param('amount') amount: number): Promise<Array<NewestMapFeatureDto>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    const mapObjects = await this.mapService.getNewestObjects(amount);

    const newestFeatures = new Array<NewestMapFeatureDto>();
    for (const obj of mapObjects) {
      newestFeatures.push({
        id: obj.id,
        userLogin: obj.user.login,
        userAvatar: obj.user.avatar,
        name: obj.name,
        date: obj._id.getTimestamp(),
        coordinates: obj.coordinates,
      });
    }

    return newestFeatures;
  }
}
