import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

export type CategoryDocument = Category & Document & { _id: mongoose.Types.ObjectId };

@Schema({ timestamps: false })
export class Category {
  @ApiProperty({ example: '6202777bb6932aed50883e35', description: 'Уникальный id категории' })
  id: string;

  @ApiProperty({ example: 'qwerty', description: 'Название категории' })
  @Prop()
  name: string;

  @ApiProperty({ example: '[]', description: 'Иконка категории' })
  @Prop()
  icon?: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.virtual('id').get(function (this: CategoryDocument) {
  return this._id.toHexString();
});

CategorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});
