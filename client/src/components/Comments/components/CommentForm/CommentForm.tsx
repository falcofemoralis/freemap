import CommentsService from '@/services/comments.service';
import { IComment } from '@/types/IComment';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CommentForm.scss';

interface CommentFormProps {
  featureId: string;
  onSubmit: (comment: IComment) => void;
  parentId?: string;
}
export const CommentForm: React.FC<CommentFormProps> = ({ featureId, onSubmit, parentId }) => {
  const { t } = useTranslation();

  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

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
      <FormControl className='commentForm' variant='outlined'>
        <InputLabel>{t('ADD_COMMENT')}</InputLabel>
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
          label={t('ADD_COMMENT')}
        />
      </FormControl>
      <Divider />
    </>
  );
};
