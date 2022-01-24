import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MapService } from './map.service';
import { ObjectTypeDto } from 'shared/dto/map/objectType.dto';
import { GeometryTypeDto } from 'shared/dto/map/geometryType.dto';
import { MapDataDto, MapFeatureDto, MapFeaturePropertiesDto } from 'shared/dto/map/mapdata.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { MapObjectGuard } from './guards/mapObjectGuard';
import { UserDto } from 'shared/dto/auth/user.dto';
import { MapFeatureDocument } from './schemas/mapFeature.schema';
import { GetMapDataQuery } from './queries/getMapData.query';

const MEDIA_PATH = './uploads/media';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Получение объектов на карте
   * @param latT - верхняя точка широты
   * @param lonR - правая точка долготы
   * @param latB - нижняя точка широты
   * @param lonL - левая точка долготы
   * @returns {MapDataDto} - пак данных
   */
  @Get()
  async getMapData(@Query() queryParams: GetMapDataQuery): Promise<MapDataDto> {
    const features = await this.packMapFeatures(await this.mapService.getAllObjects(queryParams.latT, queryParams.lonR, queryParams.latB, queryParams.lonL, queryParams.zoom));

    console.log(features);

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
  async addMapObject(@Body() dataDto: MapFeaturePropertiesDto, @Request() req): Promise<MapFeatureDto> {
    if (!dataDto.typeId || !dataDto.coordinates || !dataDto.zoom) {
      throw new BadRequestException();
    }

    if (!dataDto.name || dataDto.name.length > 30) {
      throw new BadRequestException();
    }

    if (!dataDto.description || dataDto.description.length > 200) {
      throw new BadRequestException();
    }

    if (!dataDto.typeId) {
      throw new BadRequestException();
    }

    if (dataDto.coordinates.length == 0) {
      throw new BadRequestException();
    }

    if (dataDto.links && dataDto.links?.length > 100) {
      throw new BadRequestException();
    }

    if (dataDto.address && dataDto.address?.length > 50) {
      throw new BadRequestException();
    }

    const userId = (req.user as UserDto).id;
    if (!userId) {
      throw new BadRequestException();
    }

    dataDto.userId = userId;

    const insertedMapObject = await this.mapService.addMapObject(dataDto);

    return (await this.packMapFeatures([insertedMapObject]))[0];
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

  //--------------

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
   * Добавление нового типа объекта
   * @param {ObjectTypeDto} objectTypeDto - тип объекта
   */
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
  async getNewestObjects(@Param('amount') amount: number): Promise<Array<MapFeatureDto>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    return await this.packMapFeatures(await this.mapService.getNewestObjects(amount));
  }

  /**
   * Упакова feature в соотвествии с форматов geoJson
   * @param mapObjects - список объектов в базе данных
   * @returns {Array<MapFeatureDto>} - массив features
   */
  async packMapFeatures(mapObjects: Array<MapFeatureDocument>): Promise<Array<MapFeatureDto>> {
    const features = new Array<MapFeatureDto>();

    for (const obj of mapObjects) {
      try {
        const coordinates: number[][] = [];
        for (const coordinate of obj.coordinates) {
          coordinates.push([coordinate.lon, coordinate.lat]);
        }

        const featureProperties: MapFeaturePropertiesDto = {
          id: obj.id,
          userId: obj.user.id,
          typeId: obj.type.id,
          name: obj.name,
          description: obj.description,
          zoom: obj.zoom,
          date: obj._id.getTimestamp(),
          address: obj.address,
          links: obj.links,
          coordinates: [],
        };

        console.log(obj.type?.geometryType?.geometry);
        features.push({
          type: 'Feature',
          properties: featureProperties,
          geometry: {
            type: obj.type?.geometryType?.geometry,
            coordinates: [coordinates],
          },
        });
      } catch (e) {
        console.log(e);
      }
    }

    return features;
  }
}
