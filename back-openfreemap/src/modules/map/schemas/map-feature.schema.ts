import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { ObjectType, ObjectTypeDocument } from './object-type.schema';

export interface Coordinate {
  lon: number;
  lat: number;
}

export type MapFeatureDocument = MapFeature & Document;

@Schema()
export class MapFeature {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name })
  user: UserDocument;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ObjectType.name })
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
