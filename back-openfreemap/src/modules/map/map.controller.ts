import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Query, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MapService } from './map.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { MapObjectGuard } from './guards/map-object.guard';
import { FullFeatureDataDto, MapDataDto, MapFeatureDto, NewestFeatureDataDto, ShortFeatureDataDto, CreateFeatureDataDto, Coordinate } from '../../dto/map/map-data.dto';
import { UserDto } from '../../dto/auth/user.dto';
import { ObjectTypeDto } from '../../dto/map/object-type.dto';
import { GeometryTypeDto } from '../../dto/map/geometry-type.dto';
import { BboxDto } from '../../dto/map/bbox.dto';

const MEDIA_PATH = './uploads/media';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /**
   * Получение объектов на карте
   * @param {BboxDto} bbox - область поиска объектов на карте
   * @returns {MapDataDto<ShortFeatureDataDto>} - пак данных с объектами на карте
   */
  @Get()
  async getMapData(@Query() bbox: BboxDto): Promise<MapDataDto<ShortFeatureDataDto>> {
    const mapObjects = await this.mapService.getAllObjects(bbox);

    const features = new Array<MapFeatureDto<ShortFeatureDataDto>>();
    for (const obj of mapObjects) {
      const featureProperties: ShortFeatureDataDto = {
        id: obj.id,
        typeId: obj.type.id,
        name: obj.name,
        date: obj._id.getTimestamp(),
      };

      features.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: obj.type?.geometryType?.geometry,
          coordinates: this.parseCoordinates(obj.coordinates),
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
   * @param {CreateFeatureDataDto} featureDto - веденные данные пользователем про объект
   * @param req - запрос с объектом пользователя
   * @returns {MapFeatureDto<ShortFeatureDataDto>} - объект карты
   */
  @UseGuards(JwtAuthGuard)
  @Post('object')
  async addMapObject(@Body() featureDto: CreateFeatureDataDto, @Request() req): Promise<MapFeatureDto<ShortFeatureDataDto>> {
    const insertedMapObject = await this.mapService.addMapObject(featureDto, (req.user as UserDto).id);

    const featureProperties: ShortFeatureDataDto = {
      id: insertedMapObject.id,
      typeId: insertedMapObject.type.id,
      name: insertedMapObject.name,
      date: insertedMapObject._id.getTimestamp(),
    };

    return {
      type: 'Feature',
      properties: featureProperties,
      geometry: {
        type: insertedMapObject.type?.geometryType?.geometry,
        coordinates: this.parseCoordinates(insertedMapObject.coordinates),
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

    console.log(types);

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
  async getNewestObjects(@Param('amount') amount: number): Promise<Array<MapFeatureDto<NewestFeatureDataDto>>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    const mapObjects = await this.mapService.getNewestObjects(amount);

    const newestFeatures = new Array<MapFeatureDto<NewestFeatureDataDto>>();
    for (const obj of mapObjects) {
      const featureProperties: NewestFeatureDataDto = {
        id: obj.id,
        userLogin: obj.user.login,
        userAvatar: obj.user.avatar,
        name: obj.name,
        date: obj._id.getTimestamp(),
        coordinates: obj.coordinates,
        zoom: obj.zoom,
      };

      newestFeatures.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: obj.type?.geometryType?.geometry,
          coordinates: this.parseCoordinates(obj.coordinates),
        },
      });
    }

    return newestFeatures;
  }

  /**
   * Получение всех данных про объект
   * @param id - id объект
   */
  @Get('object/:id')
  async getMapObject(@Param('id') id: string): Promise<MapFeatureDto<FullFeatureDataDto>> {
    if (!id) {
      throw new BadRequestException();
    }

    const mapObject = await this.mapService.getObjectById(id);

    let mediaNames = new Array<string>();
    try {
      mediaNames = fs.readdirSync(Path.join(process.cwd(), `${MEDIA_PATH}/${id}`));
    } catch (e) {
      //throw new NotFoundException();
    }

    const fullFeaturePropertiesDto: FullFeatureDataDto = {
      id,
      userId: mapObject.user.id,
      userLogin: mapObject.user.login,
      userAvatar: mapObject.user.avatar,
      typeId: mapObject.type.id,
      name: mapObject.name,
      description: mapObject.description,
      zoom: mapObject.zoom,
      date: mapObject._id.getTimestamp(),
      address: mapObject.address,
      links: mapObject.links,
      coordinates: mapObject.coordinates,
      mediaNames,
    };

    return {
      type: 'Feature',
      properties: fullFeaturePropertiesDto,
      geometry: {
        type: mapObject.type?.geometryType?.geometry,
        coordinates: this.parseCoordinates(mapObject.coordinates),
      },
    };
  }

  parseCoordinates(coordinates: Coordinate[]): number[][][] {
    const featureCoordinates: number[][] = [];
    for (const coordinate of coordinates) {
      featureCoordinates.push([coordinate.lon, coordinate.lat]);
    }

    return [featureCoordinates];
  }
}
