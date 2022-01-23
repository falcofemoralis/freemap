import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GeometryType, GeometryTypeDocument } from './geometryType.schema';
import * as mongoose from 'mongoose';

@Schema()
export class ObjectType {
  @Prop()
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: GeometryType.name })
  geometryType: GeometryTypeDocument;
}

export const ObjectTypeSchema = SchemaFactory.createForClass(ObjectType);

export type ObjectTypeDocument = ObjectType & Document;
