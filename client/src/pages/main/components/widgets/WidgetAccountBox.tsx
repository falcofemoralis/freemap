import * as React from 'react';
import { useState } from 'react';
import '../../styles/Widget.scss';
import { Avatar, Box, Button, Dialog, IconButton } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { authStore } from '../../../../store/auth.store';
import { SignUp } from '../auth/SignUp';
import { SignIn } from '../auth/SignIn';

enum DialogType {
    SIGN_UP,
    SIGN_IN
}

export const WidgetAccountBox = () => {
    const [isDialog, setDialog] = useState(false);
    const [dialogType, setDialogType] = useState<DialogType>(DialogType.SIGN_IN);

    const handleAuthOpen = () => setDialog(true);
    const handleAuthClose = () => setDialog(false);
    const changeDialogType = (type: DialogType) => setDialogType(type);

    return (
        <Box className='accountBox'>
            {!authStore.isAuth ? (
                <Button variant='contained' onClick={handleAuthOpen}>
                    Войти
                </Button>
            ) : (
                <IconButton aria-haspopup='true' color='inherit'>
                    <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>
                </IconButton>
            )}
            <Dialog onClose={handleAuthClose} open={isDialog}>
                {dialogType === DialogType.SIGN_IN ? (
                    <SignIn onSwitch={() => changeDialogType(DialogType.SIGN_UP)} />
                ) : (
                    <SignUp onSwitch={() => changeDialogType(DialogType.SIGN_IN)} />
                )}
            </Dialog>
        </Box>
    );
};
