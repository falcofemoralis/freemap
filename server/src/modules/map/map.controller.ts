import { BadRequestException, Body, Controller, Get, InternalServerErrorException, NotFoundException, Param, Post, Query, Request, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import * as Path from 'path';
import { FeatureTypeDto } from 'src/modules/map/dto/feature-type.dto';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPayload } from './../auth/guards/jwt-auth.guard';
import { FilesService } from './../files/files.service';
import { AreaDto } from './dto/area.dto';
import { Coordinate, CreateFeatureDataDto } from './dto/create-feature.dto';
import { FeatureType } from './entities/feature-type.entity';
import { MapFeature } from './entities/map-feature.entity';
import MediaInterceptor, { MEDIA_PATH } from './interceptors/media.interceptor';
import { MapService } from './map.service';
import { FeatureCollectionDto } from './types/feature-collection.dto';

const MEDIA_FOLDER = 'media';
@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly authService: AuthService, private readonly filesService: FilesService) {}

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
      console.log(featureDto);

      return await this.mapService.addMapFeature(featureDto, (req.user as UserPayload).id);
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(MediaInterceptor)
  @Post('feature/:id/media')
  async addMapFeatureMedia(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>): Promise<string[]> {
    try {
      const uploadedFiles = await this.filesService.saveFiles(files, MEDIA_FOLDER);
      await this.mapService.addMapFeatureMedia(id, uploadedFiles);
      return uploadedFiles;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
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

    try {
      mapFeature.files = await this.filesService.getFiles(mapFeature.files, MEDIA_FOLDER);
      mapFeature.user.passwordHash = undefined;
      return mapFeature;
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
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
}
