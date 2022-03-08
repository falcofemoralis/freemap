import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { Box, Button, Divider, OutlinedInput, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import React from 'react';
import CommentsService from '../services/comments.service';
import { authStore } from '../store/auth.store';
import { IComment } from '../types/IComment';
import { UserAvatar } from './UserAvatar';

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

interface CommentProps {
  featureId: string;
  comment: IComment;
  indent?: number;
  index: number;
  onReply: (comment: IComment, index: number) => void;
}
const Comment: React.FC<CommentProps> = ({ featureId, comment, indent, onReply, index }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);
  const onSubmit = (comment: IComment) => {
    comment.indent = (indent ?? 0) + 1;
    onReply(comment, index + 1);
    handleOpen();
  };

  return (
    <>
      <Box sx={{ display: 'flex', mt: 2, ml: 2 * (indent ?? 0) }}>
        <UserAvatar user={comment.user} sx={{ mr: 1 }} />
        <Box>
          <Typography variant='subtitle2'>
            {comment.user.username} • {new Date(comment.createdAt).toLocaleString()}
          </Typography>
          <Typography variant='body1'>{comment.text}</Typography>
          <Button variant='text' onClick={handleOpen}>
            Reply
          </Button>
        </Box>
      </Box>
      {open && <CommentForm featureId={featureId} parentId={comment.id} onSubmit={onSubmit} />}
    </>
  );
};

interface CommentFormProps {
  featureId: string;
  onSubmit: (comment: IComment) => void;
  parentId?: string;
}
const CommentForm: React.FC<CommentFormProps> = ({ featureId, onSubmit, parentId }) => {
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const sendComment = async () => {
    setLoading(true);
    try {
      const comment = await CommentsService.addComment(featureId, text, parentId);
      onSubmit(comment);
      setText('');
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <>
      <FormControl sx={{ width: '100%', mt: 2, mb: 2 }} variant='outlined'>
        <InputLabel>Добавить комментарий</InputLabel>
        <OutlinedInput
          value={text}
          onChange={handleChange}
          endAdornment={
            <InputAdornment position='end'>
              {text && (
                <IconButton onClick={sendComment} edge='end'>
                  {loading ? <CircularProgress /> : <SendOutlinedIcon />}
                </IconButton>
              )}
            </InputAdornment>
          }
          label='Добавить комментарий'
        />
      </FormControl>
      <Divider />
    </>
  );
};
