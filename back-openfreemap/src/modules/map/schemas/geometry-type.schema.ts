import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class GeometryType {
  @Prop()
  name: string;

  @Prop()
  key: string;

  @Prop()
  geometry: string;
}

export const GeometryTypeSchema = SchemaFactory.createForClass(GeometryType);

export type GeometryTypeDocument = GeometryType & Document;
