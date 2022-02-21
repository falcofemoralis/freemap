import { CircularProgress, IconButton, Paper, styled, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { useState } from 'react';
import { authStore } from '../store/auth.store';
import { UserAvatar } from './UserAvatar';

const SETTINGS_WIDTH = 372;

export const AccountSettings = observer(() => {
    const [loading, setLoading] = useState(false);

    const Input = styled('input')({
        display: 'none'
    });

    const onImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setLoading(true);
            await authStore.updateUserAvatar(files[0]);
            setLoading(false);
        }
    };

    return (
        <Paper
            sx={{ p: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', width: SETTINGS_WIDTH }}
        >
            <IconButton sx={{ mb: 2 }}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <label htmlFor='contained-button-file'>
                        <Input accept='image/*' id='contained-button-file' type='file' onChange={onImgUpload} />
                        <UserAvatar sx={{ width: 64, height: 64, cursor: 'pointer' }} user={authStore.user} />
                    </label>
                )}
            </IconButton>

            <Typography variant='h4'>{authStore?.user?.username}</Typography>
        </Paper>
    );
});
