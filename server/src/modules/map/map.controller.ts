import { MapFeature } from './entities/map-feature.entity';
import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Query, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as Path from 'path';
import { FeatureTypeDto } from 'src/modules/map/dto/feature-type.dto';
import { AreaDto } from './dto/area.dto';
import { Coordinate, CreateFeatureDataDto } from './dto/create-feature.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPayload } from './../auth/guards/jwt-auth.guard';
import { FeatureType } from './entities/feature-type.entity';
import MediaInterceptor, { MEDIA_PATH } from './interceptors/media.interceptor';
import { MapService } from './map.service';
import { FeatureCollectionDto } from './types/feature-collection.dto';

@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Получение данных объект на карте в определенной области' })
  @ApiResponse({ status: 200, type: FeatureCollectionDto, description: 'Пак объектов FeatureCollection' })
  @Get()
  async getMapData(@Query() areaDto: AreaDto): Promise<FeatureCollectionDto> {
    const mapFeatures = await this.mapService.getAllMapFeatures(areaDto);

    const features = [];
    for (const mapFeature of mapFeatures) {
      const { id, name, createdAt } = mapFeature;

      features.push({
        type: 'Feature',
        properties: { id, name, createdAt },
        geometry: {
          type: mapFeature.type.geometry,
          coordinates: this.convertCoordinatesToArray(mapFeature.coordinates),
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
  @UseInterceptors(MediaInterceptor)
  async addMapFeature(@Body() featureDto: CreateFeatureDataDto, @UploadedFiles() files: Array<Express.Multer.File>, @Request() req): Promise<MapFeature> {
    const media = new Array<string>();
    if (files) {
      for (const file of files) {
        media.push(file.filename);
      }
    }

    const insertedFeature = await this.mapService.addMapFeature(featureDto, media, (req.user as UserPayload).id);

    return insertedFeature;
  }

  @ApiOperation({ summary: 'Добавление нового типа объекта' })
  @ApiHeader({ name: 'Authorization', description: 'Токен пользователя' })
  @ApiResponse({ status: 201, type: FeatureType, description: 'Тип объекта' })
  @UseGuards(JwtAuthGuard)
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

  // /**
  //  * Получение списка последних добавленных объектов на карту
  //  * @param amount - количество объектов которые можно получить
  //  */
  // @Get('feature/newest/:amount')
  // async getNewestFeatures(@Param('amount') amount: number): Promise<Array<MapFeatureDto<NewestFeatureDataDto>>> {
  //   if (amount > 100) {
  //     throw new ForbiddenException();
  //   }

  //   const mapFeatures = await this.mapService.getNewestFeatures(amount);

  //   const newestFeatures = new Array<MapFeatureDto<NewestFeatureDataDto>>();
  //   for (const obj of mapFeatures) {
  //     const user = await this.authService.findUserById(obj.userId);

  //     const featureProperties: NewestFeatureDataDto = {
  //       ...obj,
  //       createdAt: obj.createdAt.toDateString(),
  //       userId: user.id,
  //       userLogin: user.login,
  //       userAvatar: user.avatar,
  //     };

  //     newestFeatures.push({
  //       type: 'Feature',
  //       properties: featureProperties,
  //       geometry: {
  //         type: (await this.mapService.getGeometryTypeByTypeId(obj.typeId)).geometry,
  //         coordinates: this.convertCoordinatesToArray(obj.coordinates),
  //       },
  //     });
  //   }

  //   return newestFeatures;
  // }

  @ApiOperation({ summary: 'Получение всех данных про объект' })
  @ApiResponse({ status: 200, type: MapFeature, description: 'Объект карты' })
  @Get('feature/:id')
  async getMapFeature(@Param('id') id: string): Promise<MapFeature> {
    if (!id) {
      throw new BadRequestException();
    }

    const mapFeature = await this.mapService.getMapFeatureById(id);

    if (!mapFeature) {
      throw new NotFoundException();
    }

    mapFeature.user.passwordHash = undefined;

    return mapFeature;
  }

  @ApiOperation({ summary: 'Получение медиа файла с сервера' })
  @ApiResponse({ status: 201, type: String, description: 'Медиа файл' })
  @Get('feature/:id/media/:name')
  getMediaFile(@Param('id') id: string, @Param('name') name: string, @Res() res) {
    const path = Path.join(process.cwd(), `${MEDIA_PATH}/${id}/${name}`);

    try {
      if (fs.existsSync(path)) {
        res.sendFile(path);
      } else {
        new NotFoundException();
      }
    } catch (e) {
      throw new NotFoundException();
    }
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
