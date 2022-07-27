import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Feature, Position } from 'geojson';
import * as mongoose from 'mongoose';
import { User } from 'src/modules/auth/entities/user.entity';
import { Media } from '../types/media';
import { GeometryProp } from './../types/map-data';
import { Category } from './category.entity';
import { FeatureType } from './feature-type.entity';

export type MapFeatureDocument = MapFeature & Document & { _id: mongoose.Types.ObjectId };

export class MapFeatureProps {
  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Пользователь который добавил объект' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', autopopulate: { select: '-email -passwordHash' } })
  user: User;

  @ApiProperty({ example: 'Building - Qwerty', description: 'Название объекта' })
  @Prop()
  name: string;

  @ApiProperty({ example: 'Lorem ipsum dolor', description: 'Описание объекта' })
  @Prop()
  description: string;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Тип категории' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FeatureType', autopopulate: true })
  type: FeatureType;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Категория объекта' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category', autopopulate: true })
  category: Category;

  @ApiProperty({ example: 'qwerty', description: 'Адрес объекта' })
  @Prop()
  address?: string;

  @ApiProperty({ example: '3809153355', description: 'Телефон' })
  @Prop()
  phone?: string;

  @ApiProperty({ example: 'wiki.com/...', description: 'Ссылка на википедию' })
  @Prop()
  wiki?: string;

  @ApiProperty({ example: '[url1, url2]', description: 'Дополнительные ссылки объекта' })
  @Prop()
  links?: string[];

  @ApiProperty({ example: '1644614313760', description: 'Unix Время создание объекта' })
  @Prop()
  createdAt: number;

  @ApiProperty({ example: '[1.jpg, 2.jpg]', description: 'Медиа файлы' })
  @Prop()
  files: Media[];

  @ApiProperty({ example: '[]', description: 'Комментарии' })
  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'UserComment', autopopulate: true })
  comments: string[];
}

class MultiLineString {
  @Prop()
  type: 'MultiLineString';
  @Prop()
  coordinates: Position[][];
}

class Polygon {
  @Prop()
  type: 'Polygon';
  @Prop()
  coordinates: Position[][];
}

class MultiPolygon {
  @Prop()
  type: 'MultiPolygon';
  @Prop()
  coordinates: Position[][][];
}

@Schema()
export class MapFeature implements Feature<GeometryProp, MapFeatureProps> {
  @ApiProperty({ example: '6202777bb6932aed20883e35', description: 'Уникальный id объекта' })
  id: string;

  @Prop()
  type: 'Feature';

  @Prop({ type: MultiLineString && Polygon && MultiPolygon })
  geometry: MultiLineString | Polygon | MultiPolygon;

  @Prop({ type: MapFeatureProps })
  properties: MapFeatureProps;
}

export const MapFeatureSchema = SchemaFactory.createForClass(MapFeature);

// MapFeatureSchema.virtual('id').get(function (this: MapFeatureDocument) {
//   return this._id.toHexString();
// });

MapFeatureSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.properties.id = ret._id;
    delete ret._id;
    delete ret.__v;

    ret.properties.files?.map((file) => {
      file.name = `${process.env.DOMAIN}/api/map/feature/media/${file.name}`;
      return file;
    });
  },
});
