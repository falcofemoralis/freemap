import { authStore } from '@/store/auth.store';
import { IComment } from '@/types/IComment';
import { Box } from '@mui/material';
import React from 'react';
import { CommentForm } from './components/CommentForm/CommentForm';
import { Comment } from './components/Comment/Comment';

interface CommentsProps {
  comments: IComment[];
  featureId: string;
}
export const Comments: React.FC<CommentsProps> = ({ comments, featureId }) => {
  const sortedComment = comments.sort((el1, el2) => el2.createdAt - el1.createdAt);
  const allComments: IComment[] = [];

  const getReplies = (replies: IComment[], indent: number) => {
    for (const reply of replies) {
      reply.indent = indent;
      allComments.push(reply);

      if (reply.replies.length > 0) {
        getReplies(reply.replies, indent + 1);
      }
    }
  };

  for (const comment of sortedComment) {
    allComments.push(comment);
    getReplies(comment.replies, 1);
  }

  const [commentsArr, setComments] = React.useState<IComment[]>(allComments);
  const onSubmit = (comment: IComment) => setComments([comment, ...commentsArr]);
  const onReply = (comment: IComment, index: number) => {
    const tmp: IComment[] = [];
    commentsArr.forEach((el, i) => {
      console.log(index);

      if (i == index) {
        tmp.push(comment);
      }

      tmp.push(el);
    });
    setComments(tmp);
  };

  return (
    <Box>
      {authStore.isAuth && <CommentForm featureId={featureId} onSubmit={onSubmit} />}
      {commentsArr.map((comment, i) => (
        <Comment key={comment.id} index={i} featureId={featureId} comment={comment} indent={comment.indent} onReply={onReply} />
      ))}
    </Box>
  );
};
