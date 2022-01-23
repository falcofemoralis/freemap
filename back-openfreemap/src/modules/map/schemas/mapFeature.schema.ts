import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { ObjectType, ObjectTypeDocument } from './objectType.schema';

export interface Coordinate {
  lon: number;
  lat: number;
}

@Schema()
export class MapFeature {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: UserDocument;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: ObjectType.name })
  type: ObjectTypeDocument;

  @Prop()
  zoom: number;

  @Prop()
  coordinates: Coordinate[]; // [[lon, lat]]

  @Prop()
  address?: string;

  @Prop()
  links?: string[];
}

export const MapFeatureSchema = SchemaFactory.createForClass(MapFeature);

export type MapFeatureDocument = MapFeature & Document;
