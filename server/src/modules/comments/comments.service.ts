import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapFeature, MapFeatureDocument } from '../map/entities/map-feature.entity';
import { CommentDto } from './dto/comment.dto';
import { CommentDocument, UserComment } from './entities/user-comment';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(MapFeature.name) private mapFeatureModel: Model<MapFeatureDocument>, @InjectModel(UserComment.name) private commentModel: Model<CommentDocument>) {}

  async createComment(userId: string, commentDto: CommentDto) {
    const comment = new this.commentModel({ text: commentDto.text, user: userId, createdAt: Date.now(), parentCommentId: commentDto.parentCommentId });
    const createdComment = await (await comment.save()).populate([{ path: 'user', select: '-email -passwordHash' }]);

    if (commentDto.parentCommentId) {
      await this.commentModel.findByIdAndUpdate({ _id: commentDto.parentCommentId }, { $push: { replies: createdComment.id } });
    } else {
      await this.mapFeatureModel.findByIdAndUpdate({ _id: commentDto.featureId }, { $push: { comments: createdComment.id } });
    }
    return createdComment;
  }
}
