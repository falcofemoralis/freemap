import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
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
import { ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FeatureTypeDto } from 'src/modules/map/dto/feature-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPayload } from './../auth/guards/jwt-auth.guard';
import { FilesService } from './../files/files.service';
import { FileOptionsQuery } from './../files/query/media.query';
import { UsersService } from './../users/users.service';
import { CreateFeatureDataDto, Coordinate } from './dto/create-feature.dto';
import { FeatureType } from './entities/feature-type.entity';
import { MapFeature } from './entities/map-feature.entity';
import { MapFeatureGuard } from './guards/map-feature.guard';
import MediaInterceptor from './interceptors/media.interceptor';
import { MapService } from './map.service';
import { AreaQuery } from './query/area.query';
import { FeatureCollectionDto } from './types/feature-collection.dto';

const MEDIA_FOLDER = 'media';
@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly usersService: UsersService, private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Получение данных объект на карте в определенной области' })
  @ApiResponse({ status: 200, type: FeatureCollectionDto, description: 'Пак объектов FeatureCollection' })
  @Get()
  async getMapData(@Query() areaQuery: AreaQuery): Promise<FeatureCollectionDto> {
    const calcSq = (coordinates: Coordinate[]): number => {
      const sides: number[] = [];

      console.log('calc sides');

      console.log('len ' + coordinates.length);

      for (let i = 0; i < coordinates.length; ++i) {
        console.log(i);

        // lon = x, lat = y
        const A = coordinates[i];
        const B = i == coordinates.length - 1 ? coordinates[0] : coordinates[i + 1];
        console.log('calc AB between: ');
        console.log(A);
        console.log(B);

        const AB = Math.sqrt(Math.pow(B.lon - A.lon, 2) + Math.pow(B.lat - A.lat, 2));
        console.log('AB=' + AB);

        sides.push(AB);
      }

      console.log('SIDES=');
      console.log(sides);

      console.log('calc p2');

      let p2 = 0;
      for (const side of sides) {
        p2 += side;
      }
      p2 /= 2;
      console.log('p2=' + p2);

      console.log('calc sq');
      // фор­му­ла Брах­ма­гуп­ты
      let sq = 1;
      for (const side of sides) {
        const n = p2 - side;
        sq *= n;
      }

      sq = Math.sqrt(sq);

      return sq;
    };

    const mapFeatures = (await this.mapService.getAllMapFeatures(areaQuery)).filter((feature) => {
      let featureLonL = 999999;
      let featureLonR = 0;
      let featureLatB = 999999;
      let featureLatT = 0;
      for (const coordinate of feature.coordinates) {
        if (coordinate.lon < featureLonL) {
          featureLonL = coordinate.lon;
        }

        if (coordinate.lon > featureLonR) {
          featureLonR = coordinate.lon;
        }

        if (coordinate.lat < featureLatB) {
          featureLatB = coordinate.lat;
        }

        if (coordinate.lat > featureLatT) {
          featureLatT = coordinate.lat;
        }
      }

      const x0 = areaQuery.lonR - areaQuery.lonL;
      const y0 = areaQuery.latT - areaQuery.latB;
      const x1 = featureLonR - featureLonL;
      const y1 = featureLatT - featureLatB;

      const fx = (x1 * 100) / x0;
      const fy = (y1 * 100) / y0;

      return (fx > 2 && fx < 95) || (fy > 2 && fy < 95);
    });

    const features = [];
    for (const mapFeature of mapFeatures) {
      const { id, name, createdAt, type } = mapFeature;

      features.push({
        type: 'Feature',
        properties: { id, name, createdAt, type },
        geometry: {
          type: mapFeature.type.geometry,
          coordinates: mapFeature.coordinates,
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

  @ApiOperation({ summary: 'Добавление нового объекта в базу данных' })
  @ApiHeader({ name: 'auth', description: 'Токен пользователя' })
  @ApiResponse({ status: 201, type: MapFeature, description: 'Объект карты' })
  @UseGuards(JwtAuthGuard)
  @Post('feature')
  async addMapFeature(@Body() featureDto: CreateFeatureDataDto, @Request() req): Promise<MapFeature> {
    try {
      const userId = (req.user as UserPayload).id;
      const insertedFeature = await this.mapService.addMapFeature(featureDto, userId);
      await this.usersService.addUserExperience(userId, 1000);
      return insertedFeature;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @ApiOperation({ summary: 'Добавление медиа файлов к объекту' })
  @ApiHeader({ name: 'auth', description: 'Токен пользователя' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: [String], description: 'Добавленные медиа файлы' })
  @UseGuards(JwtAuthGuard, MapFeatureGuard)
  @UseInterceptors(MediaInterceptor)
  @Post('feature/:id/media')
  async addMapFeatureMedia(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>): Promise<string[]> {
    try {
      const uploadedFiles = await this.filesService.saveFiles(files, { maxWidth: 1920, previewMaxWidth: 420, subfolder: MEDIA_FOLDER });
      await this.mapService.addMapFeatureMedia(id, uploadedFiles);
      return uploadedFiles;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @ApiOperation({ summary: 'Добавление нового типа объекта' })
  //  @ApiHeader({ name: 'Authorization', description: 'Токен пользователя' })
  @ApiResponse({ status: 201, type: FeatureType, description: 'Тип объекта' })
  // @UseGuards(JwtAuthGuard)
  @Post('feature/type')
  async createFeatureType(@Body() featureTypeDto: FeatureTypeDto): Promise<FeatureType> {
    return await this.mapService.createFeatureType(featureTypeDto);
  }

  @ApiOperation({ summary: 'Получение всех типов объекта' })
  @ApiResponse({ status: 200, type: [FeatureType], description: 'Массив типов объекта' })
  @Get('feature/types')
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return await this.mapService.getFeatureTypes();
  }

  @ApiOperation({ summary: 'Получение файла медиа с сервера' })
  @ApiResponse({ status: 200, type: String, description: 'Медиа файл' })
  @Get('feature/media/:file')
  async getFeatureMedia(@Param('file') file: string, @Res() res: Response, @Query() optionsQuery: FileOptionsQuery) {
    try {
      const media = (await this.filesService.downloadFiles([file], { subfolder: MEDIA_FOLDER, fileType: optionsQuery.type }))[0];

      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${media.filename}"`,
        'Content-Type': media.mimeType,
      });

      res.end(media.buffer);
    } catch (e) {
      console.log(e);

      throw new NotFoundException();
    }
  }

  @ApiOperation({ summary: 'Получение всех данных про объект' })
  @ApiResponse({ status: 200, type: MapFeature, description: 'Объект карты' })
  @UseGuards(MapFeatureGuard)
  @Get('feature/:id')
  async getMapFeature(@Param('id') id: string): Promise<MapFeature> {
    if (!id) {
      throw new BadRequestException();
    }

    const mapFeature = await this.mapService.getMapFeatureById(id);

    if (!mapFeature) {
      throw new NotFoundException();
    }

    try {
      mapFeature.user.passwordHash = undefined;
      return mapFeature;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @ApiOperation({ summary: 'Получение списка последних добавленных объектов на карту' })
  @ApiResponse({ status: 200, type: [MapFeature], description: 'Объекты карты' })
  @Get('newest/:amount')
  getNewestFeatures(@Param('amount') amount: number): Promise<Array<MapFeature>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    return this.mapService.getNewestFeatures(amount);
  }
}
