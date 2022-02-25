import { UserComment, CommentSchema } from './entities/user-comment';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MapFeature, MapFeatureSchema } from '../map/entities/map-feature.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MapFeature.name, schema: MapFeatureSchema },
      { name: UserComment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
