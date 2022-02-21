import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as mongoose from 'mongoose';

export type UserDocument = User & Document & { _id: mongoose.Types.ObjectId };

@Schema({ timestamps: false })
export class User {
  @ApiProperty({ example: '6202777bb6932aedd0883e35', description: 'Уникальный id пользователя' })
  id: string;

  @ApiProperty({ example: 'Jane_Doe', description: 'Никнейм пользователя' })
  @Prop()
  username: string;

  @Exclude()
  @ApiProperty({ example: 'qwerty', description: 'Пароль пользователя' })
  @Prop()
  passwordHash: string;

  @ApiProperty({ example: 'email@gmail.com', description: 'Email пользователя' })
  @Prop()
  email: string;

  @ApiProperty({ example: '1.jpg', description: 'Аватар пользователя' })
  @Prop()
  userAvatar: string;

  @ApiProperty({ example: '#ff6f00', description: 'Цвет пользователя' })
  @Prop()
  userColor: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function (this: UserDocument) {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
  },
});
