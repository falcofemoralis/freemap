import { Box, Button, Dialog, IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { AccountSettings } from '../../../../components/AccountSettings';
import { UserAvatar } from '../../../../components/UserAvatar';
import { FileType } from '../../../../constants/file.type';
import { authStore } from '../../../../store/auth.store';
import '../../styles/Widget.scss';
import { SignIn } from '../auth/SignIn';
import { SignUp } from '../auth/SignUp';

enum DialogType {
    SIGN_UP,
    SIGN_IN
}

export const WidgetAccountBox = observer(() => {
    console.log('WidgetAccountBox');

    if (authStore.isAuth && !authStore.user) {
        authStore.getUserProfile();
    }

    const [isDialog, setDialog] = React.useState(false);
    const [dialogType, setDialogType] = React.useState<DialogType>(DialogType.SIGN_IN);
    const [open, setOpen] = React.useState(false);

    const handleAuthOpen = () => setDialog(true);
    const handleAuthClose = () => setDialog(false);
    const changeDialogType = (type: DialogType) => setDialogType(type);

    return (
        <Box className='accountBox'>
            {!authStore.isAuth ? (
                <Box>
                    <Button variant='contained' onClick={handleAuthOpen}>
                        Войти
                    </Button>
                    <Dialog onClose={handleAuthClose} open={isDialog}>
                        {dialogType === DialogType.SIGN_IN ? (
                            <SignIn onSwitch={() => changeDialogType(DialogType.SIGN_UP)} />
                        ) : (
                            <SignUp onSwitch={() => changeDialogType(DialogType.SIGN_IN)} />
                        )}
                    </Dialog>
                </Box>
            ) : (
                <IconButton aria-haspopup='true' color='inherit' onClick={() => setOpen(true)}>
                    <UserAvatar user={authStore.user} type={FileType.THUMBNAIL} />
                </IconButton>
            )}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <AccountSettings />
            </Dialog>
        </Box>
    );
});
