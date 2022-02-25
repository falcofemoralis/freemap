import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { User } from 'src/modules/auth/entities/user.entity';

export type CommentDocument = UserComment & Document & { _id: mongoose.Types.ObjectId };

@Schema({ timestamps: false })
export class UserComment {
  @ApiProperty({ example: '6202777bb6932aed50883e35', description: 'Уникальный id типа объекта' })
  id: string;

  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Пользователь который добавил объект' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  @ApiProperty({ example: 'qwerty', description: 'Текст комментария' })
  @Prop()
  text: string;

  @ApiProperty({ example: '123', description: 'Время создания' })
  @Prop()
  createdAt: number;

  @ApiProperty({ example: 'id', description: 'Главный комментарий' })
  @Prop()
  parentCommentId: string;
}

export const CommentSchema = SchemaFactory.createForClass(UserComment);

CommentSchema.virtual('id').get(function (this: CommentDocument) {
  return this._id.toHexString();
});

CommentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});
