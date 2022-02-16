import { Avatar, Box, Button, Dialog, IconButton } from '@mui/material';
import { deepOrange } from '@mui/material/colors';
import { observer } from 'mobx-react-lite';
import React from 'react';
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

    const [isDialog, setDialog] = React.useState(false);
    const [dialogType, setDialogType] = React.useState<DialogType>(DialogType.SIGN_IN);

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
                <IconButton aria-haspopup='true' color='inherit'>
                    <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>
                </IconButton>
            )}
        </Box>
    );
});
