import { BadRequestException, Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Query, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MapService } from './map.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import * as Path from 'path';
import { v4 } from 'uuid';
import * as fs from 'fs';
import { MapObjectGuard } from './guards/map-object.guard';
import { Coordinate, CreateFeatureDataDto, FullFeatureDataDto, MapDataDto, MapFeatureDto, NewestFeatureDataDto, ShortFeatureDataDto } from '../../dto/map/map-data.dto';
import { UserDto } from '../../dto/auth/user.dto';
import { FeatureTypeDto } from '../../dto/map/feature-type.dto';
import { GeometryTypeDto } from '../../dto/map/geometry-type.dto';
import { BboxDto } from '../../dto/map/bbox.dto';
import { MapFeature } from './entities/map-feature.entity';
import { FeatureType } from './entities/feature-type.entity';
import { AuthService } from '../auth/auth.service';

const MEDIA_PATH = './uploads/media';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly authService: AuthService) {}

  /**
   * Получение объектов на карте
   * @param {BboxDto} bbox - область поиска объектов на карте
   * @returns {MapDataDto<ShortFeatureDataDto>} - пак данных с объектами на карте
   */
  @Get()
  async getMapData(@Query() bbox: BboxDto): Promise<MapDataDto<ShortFeatureDataDto>> {
    const mapFeatures = await this.mapService.getAllMapFeatures(bbox);

    const features = new Array<MapFeatureDto<ShortFeatureDataDto>>();
    for (const obj of mapFeatures) {
      const { id, name } = obj;
      const featureProperties: ShortFeatureDataDto = {
        id,
        name,
        createdAt: obj.createdAt.toDateString(),
      };

      features.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: (await this.mapService.getGeometryTypeByTypeId(obj.typeId)).geometry,
          coordinates: this.convertCoordinatesToArray(obj.coordinates),
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
  @Post('feature')
  async addMapFeature(@Body() featureDto: CreateFeatureDataDto, @Request() req): Promise<MapFeatureDto<ShortFeatureDataDto>> {
    const insertedMapFeature = await this.mapService.addMapFeature(new MapFeature(featureDto, (req.user as UserDto).id));
    const { id, name } = insertedMapFeature;
    const featureProperties: ShortFeatureDataDto = {
      id,
      name,
      createdAt: insertedMapFeature.createdAt.toDateString(),
    };

    return {
      type: 'Feature',
      properties: featureProperties,
      geometry: {
        type: (await this.mapService.getGeometryTypeByTypeId(insertedMapFeature.typeId)).geometry,
        coordinates: this.convertCoordinatesToArray(insertedMapFeature.coordinates),
      },
    };
  }

  /**
   * Добавление медиа файлов к указаному объекту
   * @param files - массив медиа файлов (фото или видео)
   * @returns {Array<String>} массив имен добавленых медиа файлов
   */
  @UseGuards(JwtAuthGuard, MapObjectGuard)
  @Post('feature/media/:id')
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
  async addMapFeatureMedia(@UploadedFiles() files: Array<Express.Multer.File>): Promise<Array<string>> {
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
  @Get('feature/media/:id/:name')
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
   * @param {FeatureTypeDto} objectTypeDto - новый тип объекта
   */
  @UseGuards(JwtAuthGuard)
  @Post('feature/type')
  async createFeatureType(@Body() objectTypeDto: FeatureTypeDto): Promise<FeatureTypeDto> {
    return await this.mapService.createFeatureType(new FeatureType(objectTypeDto));
  }

  /**
   * Получение всех типов объекта
   */
  @Get('feature/types')
  async getFeatureTypes(): Promise<Array<FeatureTypeDto>> {
    return await this.mapService.getFeatureTypes();
  }

  /**
   * Получение типа объекта по id
   * @param id - id типа
   */
  @Get('feature/type/:id')
  async getFeatureTypeById(@Param('id') id: string): Promise<FeatureTypeDto> {
    return await this.mapService.getFeatureTypeById(id);
  }

  /**
   * Получение типов объектов по id геометрии
   * @param id - id геометрии
   */
  @Get('feature/types/:id')
  async getObjectTypesByGeometryId(@Param('id') id: string): Promise<Array<FeatureTypeDto>> {
    return await this.mapService.findFeatureTypesByGeometryId(id);
  }

  //--------------

  /**
   * Получение геометрий объекта
   */
  @Get('feature/geometries')
  async getGeometryTypes(): Promise<Array<GeometryTypeDto>> {
    return await this.mapService.getGeometryTypes();
  }

  /**
   * Получение геометрий объекта по id
   * @param id - id геометрии
   */
  @Get('feature/geometry/:id')
  async getGeometryTypeById(@Param('id') id: string): Promise<GeometryTypeDto> {
    return await this.mapService.getGeometryTypeByFeatureId(id);
  }

  //--------------

  /**
   * Получение списка последних добавленных объектов на карту
   * @param amount - количество объектов которые можно получить
   */
  @Get('feature/newest/:amount')
  async getNewestFeatures(@Param('amount') amount: number): Promise<Array<MapFeatureDto<NewestFeatureDataDto>>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    const mapFeatures = await this.mapService.getNewestFeatures(amount);

    const newestFeatures = new Array<MapFeatureDto<NewestFeatureDataDto>>();
    for (const obj of mapFeatures) {
      const user = await this.authService.getUserById(obj.userId);

      const featureProperties: NewestFeatureDataDto = {
        ...obj,
        createdAt: obj.createdAt.toDateString(),
        userId: user.id,
        userLogin: user.login,
        userAvatar: user.avatar,
      };

      newestFeatures.push({
        type: 'Feature',
        properties: featureProperties,
        geometry: {
          type: (await this.mapService.getGeometryTypeByTypeId(obj.typeId)).geometry,
          coordinates: this.convertCoordinatesToArray(obj.coordinates),
        },
      });
    }

    return newestFeatures;
  }

  /**
   * Получение всех данных про объект
   * @param id - id объект
   */
  @Get('feature/:id')
  async getMapFeature(@Param('id') id: string): Promise<MapFeatureDto<FullFeatureDataDto>> {
    if (!id) {
      throw new BadRequestException();
    }

    const mapFeature = await this.mapService.getMapFeatureById(id);

    if (!mapFeature) {
      throw new NotFoundException();
    }

    let mediaNames = new Array<string>();
    try {
      mediaNames = fs.readdirSync(Path.join(process.cwd(), `${MEDIA_PATH}/${id}`));
    } catch (e) {
      //throw new NotFoundException();
    }

    const user = await this.authService.getUserById(mapFeature.userId);

    const fullFeaturePropertiesDto: FullFeatureDataDto = {
      ...mapFeature,
      createdAt: mapFeature.createdAt.toDateString(),
      userId: user.id,
      userLogin: user.login,
      userAvatar: user.avatar,
      mediaNames,
    };

    return {
      type: 'Feature',
      properties: fullFeaturePropertiesDto,
      geometry: {
        type: (await this.mapService.getGeometryTypeByTypeId(mapFeature.typeId)).geometry,
        coordinates: this.convertCoordinatesToArray(mapFeature.coordinates),
      },
    };
  }

  /**
   * Перевод кординат в GeoJson формат т.е Coordinate[] в [][][]
   * @param coordinates - координаты
   */
  convertCoordinatesToArray(coordinates: Coordinate[]): number[][][] {
    const featureCoordinates: number[][] = [];
    for (const coordinate of coordinates) {
      featureCoordinates.push([coordinate.lon, coordinate.lat]);
    }

    return [featureCoordinates];
  }
}
