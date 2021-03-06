import { HttpService } from '@nestjs/axios';
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
import { TileTypes } from '../../libs/wikimapia.api';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WikimapiaApi } from './../../libs/wikimapia.api';
import { UserPayload } from './../auth/guards/jwt-auth.guard';
import { FilesService } from './../files/files.service';
import { FileOptionsQuery } from './../files/query/media.query';
import { UsersService } from './../users/users.service';
import { CategoryDto } from './dto/category.dto';
import { CreateFeatureDataDto } from './dto/create-feature.dto';
import { Category } from './entities/category.entity';
import { FeatureType } from './entities/feature-type.entity';
import { MapFeature, Position } from './entities/map-feature.entity';
import { MapFeatureGuard } from './guards/map-feature.guard';
import MediaInterceptor, { MediaType } from './interceptors/media.interceptor';
import { MapService } from './map.service';
import { AreaQuery } from './query/area.query';
import { WikimapiaQuery } from './query/wikimapia.query';
import { FeatureCollection } from './types/feature-collection';
import { LayerSource, MapData, Source } from './types/map-data';
import { Media } from './types/media';
import { LayerUtil } from './utils/layer.util';

const MEDIA_FOLDER = 'media';
@ApiTags('map')
@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService, private readonly usersService: UsersService, private readonly filesService: FilesService, private readonly httpService: HttpService) {}

  @ApiOperation({ summary: '?????????????????? ?????????? ?? ????????????' })
  @ApiResponse({ status: 200, type: [MapData], description: '???????????? ??????????' })
  @Get()
  async getMapData(@Query() areaQuery: AreaQuery): Promise<MapData> {
    const mapFeatures = await this.mapService.getAllMapFeatures(areaQuery);
    const types = await this.mapService.getFeatureTypes();
    const layers: LayerSource[] = [];
    const sources: Source[] = [];
    let generatedId = 1;

    for (const type of types) {
      for (const layer of type.layers) {
        LayerUtil.formatZoom(layer);
        layers.push({ ...layer, id: type.id + layer.id, source: type.id });
      }

      const featureCollection: FeatureCollection = {
        type: 'FeatureCollection',
        features: [],
      };

      mapFeatures
        .filter((feature) => feature.type.id == type.id)
        .forEach((feature) => {
          const { id, name, createdAt, category, type, coordinates } = feature;

          featureCollection.features.push({
            type: 'Feature',
            properties: { id, name, createdAt, category },
            geometry: {
              type: type.geometry,
              coordinates,
            },
            id: ++generatedId,
          });
        });

      if (featureCollection.features.length > 0) {
        sources.push({ id: type.id, featureCollection });
      }
    }

    return {
      version: 1,
      sources,
      layers,
    };
  }

  @ApiOperation({ summary: '?????????????????? ???????????? ?? Wikimapia.org' })
  @ApiResponse({ status: 200, type: [MapData], description: '???????????? ??????' })
  @Get('wikimapia')
  async getWikimapiaData(@Query() wikimapiaQuery: WikimapiaQuery) {
    const types = await this.mapService.getFeatureTypes();
    const type = types.find((t) => t.name == 'Wikimapia');
    const featureCollection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };
    const coords = WikimapiaApi.convertCoordinates({ h: wikimapiaQuery.h, w: wikimapiaQuery.w }, { lat: wikimapiaQuery.lat, lng: wikimapiaQuery.lng }, wikimapiaQuery.zoom - 2);

    const requests = [];
    for (let i = 0; i < 4; i++) {
      const x = i == 2 || i == 0 ? coords.x + 1 : coords.x;
      const y = i == 1 || i == 0 ? coords.y + 1 : coords.y;
      const url = WikimapiaApi.getTileUrl(x, y, wikimapiaQuery.zoom, TileTypes.OBJECTS);

      requests.push(
        this.httpService.axiosRef({
          method: 'GET',
          url: `https://open-free-map-proxy.herokuapp.com/${url}`, //http://wikimapia.org/z1/itiles/030/211/221/220/230.xy?2782950
          decompress: true,
          headers: {
            'Accept-Encoding': 'gzip, deflate',
          },
        }),
      );
    }

    const responses = await Promise.all([...requests]);

    for (const { data } of responses) {
      const wikimapiaData = WikimapiaApi.parse(data);

      for (const feature of wikimapiaData.features) {
        const coordinates: Position[][] = [[]];
        for (const p of feature.polygon) {
          coordinates[0].push([p.lng, p.lat]);
        }
        const lastPoint = feature.polygon[0];
        coordinates[0].push([lastPoint.lng, lastPoint.lat]);

        featureCollection.features.push({
          type: 'Feature',
          id: feature.id,
          properties: {
            id: feature.id.toString(),
            category: { id: '6202777bb6932aed50883e35', name: '0' },
            createdAt: 1657808119920,
            name: feature.titles['1'],
          },
          geometry: {
            type: 'Polygon',
            coordinates,
          },
        });
      }
    }

    return { id: type.id, featureCollection };
  }

  @ApiOperation({ summary: '???????????????????? ???????????? ?????????????? ?? ???????? ????????????' })
  @ApiHeader({ name: 'auth', description: '?????????? ????????????????????????' })
  @ApiResponse({ status: 201, type: MapFeature, description: '???????????? ??????????' })
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

  @ApiOperation({ summary: '???????????????????? ?????????? ???????????? ?? ??????????????' })
  @ApiHeader({ name: 'auth', description: '?????????? ????????????????????????' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(MediaType)
  @ApiResponse({ status: 201, type: [Media], description: '?????????????????????? ?????????? ??????????' })
  @UseGuards(JwtAuthGuard, MapFeatureGuard)
  @UseInterceptors(MediaInterceptor)
  @Post('feature/:id/media')
  async addMapFeatureMedia(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>, @Request() req): Promise<Media[]> {
    try {
      const userId = (req.user as UserPayload).id;
      const uploadedFiles = await this.filesService.saveFiles(files, { maxWidth: 1920, previewMaxWidth: 420, subfolder: MEDIA_FOLDER });
      return this.mapService.addMapFeatureMedia(id, userId, uploadedFiles);
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  @ApiOperation({ summary: '???????????????????? ???????????? ???????? ??????????????' })
  //  @ApiHeader({ name: 'Authorization', description: '?????????? ????????????????????????' })
  @ApiResponse({ status: 201, type: FeatureType, description: '?????? ??????????????' })
  // @UseGuards(JwtAuthGuard)
  @Post('feature/type')
  async createFeatureType(@Body() featureTypeDto: FeatureTypeDto): Promise<FeatureType> {
    return await this.mapService.createFeatureType(featureTypeDto);
  }

  @ApiOperation({ summary: '?????????????????? ???????? ?????????? ??????????????' })
  @ApiResponse({ status: 200, type: [FeatureType], description: '???????????? ?????????? ??????????????' })
  @Get('feature/types')
  async getFeatureTypes(): Promise<Array<FeatureType>> {
    return await this.mapService.getFeatureTypes();
  }

  @ApiOperation({ summary: '???????????????????? ???????????? ???????? ??????????????' })
  //  @ApiHeader({ name: 'Authorization', description: '?????????? ????????????????????????' })
  @ApiResponse({ status: 201, type: Category, description: '?????? ??????????????' })
  // @UseGuards(JwtAuthGuard)
  @Post('feature/category')
  async createCategory(@Body() categoryDto: CategoryDto): Promise<Category> {
    return await this.mapService.createCategory(categoryDto);
  }

  @ApiOperation({ summary: '?????????????????? ???????? ?????????????????? ?? ?????????????????????????? ????????' })
  @ApiResponse({ status: 200, type: [Category], description: '???????????? ??????????????????' })
  @Get('feature/categories')
  async getCategories(): Promise<Array<Category>> {
    return await this.mapService.getCategories();
  }

  @ApiOperation({ summary: '?????????????????? ?????????? ?????????? ?? ??????????????' })
  @ApiResponse({ status: 200, type: String, description: '?????????? ????????' })
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

  @ApiOperation({ summary: '?????????????????? ???????? ???????????? ?????? ????????????' })
  @ApiResponse({ status: 200, type: MapFeature, description: '???????????? ??????????' })
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

  @ApiOperation({ summary: '?????????????????? ???????????? ?????????????????? ?????????????????????? ???????????????? ???? ??????????' })
  @ApiResponse({ status: 200, type: [MapFeature], description: '?????????????? ??????????' })
  @Get('newest/:amount')
  getNewestFeatures(@Param('amount') amount: number): Promise<Array<MapFeature>> {
    if (amount > 100) {
      throw new ForbiddenException();
    }

    return this.mapService.getNewestFeatures(amount);
  }
}
