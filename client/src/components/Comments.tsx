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

interface UserComment {
    comment: IComment;
    dataIndent: number;
}
interface CommentsProps {
    comments: IComment[];
    featureId: string;
}

export const Comments: React.FC<CommentsProps> = ({ comments, featureId }) => {
    const sortedComment = comments.sort((el1, el2) => el2.createdAt - el1.createdAt);
    const allComments: UserComment[] = [];

    const getReplies = (replies: IComment[], indent: number) => {
        for (const reply of replies) {
            allComments.push({ comment: reply, dataIndent: indent });
            console.log('added ' + reply.text + '' + indent);

            if (reply.replies.length > 0) {
                getReplies(reply.replies, indent + 1);
            }
        }
    };

    for (const comment of sortedComment) {
        allComments.push({ comment, dataIndent: 0 });
        console.log('added ' + comment.text);

        getReplies(comment.replies, 1);
    }

    const [commentsArr, setComments] = React.useState<UserComment[]>(allComments);
    const onSubmit = (comment: UserComment) => setComments([comment, ...commentsArr]);
    return (
        <Box>
            {authStore.isAuth && <CommentForm featureId={featureId} onSubmit={onSubmit} />}
            {commentsArr.map(comment => (
                <Comment key={comment.comment.id} comment={comment.comment} indent={comment.dataIndent} />
            ))}
        </Box>
    );
};

interface CommentProps {
    comment: IComment;
    indent: number;
}
const Comment: React.FC<CommentProps> = ({ comment, indent }) => {
    return (
        <Box sx={{ display: 'flex', mt: 2, ml: 2 * indent }}>
            <UserAvatar user={comment.user} sx={{ mr: 1 }} />
            <Box>
                <Typography variant='subtitle2'>
                    {comment.user.username} • {new Date(comment.createdAt).toLocaleString()}
                </Typography>
                <Typography variant='body1'>{comment.text}</Typography>
                <Button variant='text'>Reply</Button>
            </Box>
        </Box>
    );
};

interface CommentFormProps {
    featureId: string;
    onSubmit: (comment: UserComment) => void;
}
const CommentForm: React.FC<CommentFormProps> = ({ featureId, onSubmit }) => {
    const [text, setText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    };

    const sendComment = async () => {
        setLoading(true);
        try {
            const comment = await CommentsService.addComment(featureId, text);
            onSubmit({ comment, dataIndent: 0 });
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
