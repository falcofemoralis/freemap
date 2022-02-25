import { UserComment } from './entities/user-comment';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserPayload } from './../auth/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Добавление нового комментария' })
  @ApiHeader({ name: 'auth', description: 'Токен пользователя' })
  @ApiResponse({ status: 201, type: UserComment, description: 'Комментарий' })
  @UseGuards(JwtAuthGuard)
  @Post()
  addComment(@Body() commentDto: CommentDto, @Req() req) {
    console.log(commentDto);

    return this.commentsService.createComment((req.user as UserPayload).id, commentDto);
  }
}
