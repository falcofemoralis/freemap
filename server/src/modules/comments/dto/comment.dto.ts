import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CommentDto {
  @IsNotEmpty()
  @IsString()
  featureId: string;

  @IsNotEmpty()
  @IsString()
  text: string;

  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
