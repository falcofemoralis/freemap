import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from 'src/modules/auth/entities/user.entity';
import { FeatureType } from './feature-type.entity';

export interface Coordinate {
  lon: number;
  lat: number;
}

export type MapFeatureDocument = MapFeature & Document & { _id: mongoose.Types.ObjectId };

@Schema()
export class MapFeature {
  @ApiProperty({ example: '6202777bb6932aed20883e35', description: 'Уникальный id объекта' })
  id: string;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Пользователь который добавил объект' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @ApiProperty({ example: 'Building - Qwerty', description: 'Название объекта' })
  @Prop()
  name: string;

  @ApiProperty({ example: 'Lorem ipsum dolor', description: 'Описание объекта' })
  @Prop()
  description: string;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Тип объекта' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'FeatureType' })
  type: FeatureType;

  @ApiProperty({ example: '15.23', description: 'Расположение объекта относительно приближения' })
  @Prop()
  zoom: number;

  @ApiProperty({ example: '[{35, 52}, {34, 43}]', description: 'Координаты объекта' })
  @Prop()
  coordinates: Coordinate[]; // [[lon, lat]]

  @ApiProperty({ example: 'qwerty', description: 'Адресс объекта' })
  @Prop()
  address?: string;

  @ApiProperty({ example: '[url1, url2]', description: 'Дополнительные ссылки объекта' })
  @Prop()
  links?: string[];

  @ApiProperty({ example: '1644614313760', description: 'Unix Время создание объекта' })
  @Prop()
  createdAt: number;

  @ApiProperty({ example: '[1.png, 2.png]', description: 'Медиа файлы' })
  @Prop()
  files: string[];
}

export const MapFeatureSchema = SchemaFactory.createForClass(MapFeature);

MapFeatureSchema.virtual('id').get(function (this: MapFeatureDocument) {
  return this._id.toHexString();
});

MapFeatureSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});
