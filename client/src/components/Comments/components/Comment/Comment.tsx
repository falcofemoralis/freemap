import { FileType } from '@/constants/file.type';
import { authStore } from '@/store/auth.store';
import { IComment } from '@/types/IComment';
import { Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '../../../UserAvatar/UserAvatar';
import { CommentForm } from '../CommentForm/CommentForm';
import './Comment.scss';

interface CommentProps {
  featureId: string;
  comment: IComment;
  indent?: number;
  index: number;
  onReply: (comment: IComment, index: number) => void;
}
export const Comment: React.FC<CommentProps> = ({ featureId, comment, indent, onReply, index }) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);
  const onSubmit = (comment: IComment) => {
    comment.indent = (indent ?? 0) + 1;
    onReply(comment, index + 1);
    handleOpen();
  };

  return (
    <>
      <Box className='comment' sx={{ ml: 2 * (indent ?? 0) }}>
        <UserAvatar user={comment.user} sx={{ mr: 1 }} type={FileType.THUMBNAIL} />
        <Box>
          <Typography variant='subtitle2'>
            {comment.user.username} • {new Date(comment.createdAt).toLocaleString()}
          </Typography>
          <Typography variant='body1'>{comment.text}</Typography>
          {authStore.isAuth && (
            <Button variant='text' onClick={handleOpen}>
              {t('REPLY')}
            </Button>
          )}
        </Box>
      </Box>
      {open && <CommentForm featureId={featureId} parentId={comment.id} onSubmit={onSubmit} />}
    </>
  );
};
