import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { GeometryType } from '../constants/geometry.type';
import { Layer } from '../types/layer';

export type FeatureTypeDocument = FeatureType & Document & { _id: mongoose.Types.ObjectId };

@Schema({ timestamps: false })
export class FeatureType {
  @ApiProperty({ example: '6202777bb6932aed50883e35', description: 'Уникальный id типа объекта' })
  id: string;

  @ApiProperty({ example: 'qwerty', description: 'Название типа' })
  @Prop()
  name: string;

  @ApiProperty({ enum: Object.values(GeometryType), description: 'Тип геометрии объекта' })
  @Prop()
  geometry: string;

  @ApiProperty({ example: '[]', description: 'Стили типа' })
  @Prop()
  layers: Layer[];

  @ApiProperty({ example: '[]', description: 'Иконка типа' })
  @Prop()
  icon?: string;
}

export const FeatureTypeSchema = SchemaFactory.createForClass(FeatureType);

FeatureTypeSchema.virtual('id').get(function (this: FeatureTypeDocument) {
  return this._id.toHexString();
});

FeatureTypeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});
