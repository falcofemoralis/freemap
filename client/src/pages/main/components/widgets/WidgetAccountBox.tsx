import { Box, Button, CircularProgress, Dialog, Divider, IconButton, LinearProgress, Paper, styled, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { UserAvatar } from '../../../../components/UserAvatar';
import { FileType } from '../../../../constants/file.type';
import { Logger } from '../../../../misc/Logger';
import { authStore } from '../../../../store/auth.store';
import '../../styles/Widget.scss';
import { SignIn } from '../auth/SignIn';
import { SignUp } from '../auth/SignUp';

enum DialogType {
  SIGN_UP,
  SIGN_IN
}

const SETTINGS_WIDTH = 372;

export const WidgetAccountBox = observer(() => {
  Logger.info('WidgetAccountBox');

  const [isDialog, setDialog] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<DialogType>(DialogType.SIGN_IN);
  const [open, setOpen] = React.useState(false);

  const handleAuthOpen = () => setDialog(true);
  const handleAuthClose = () => setDialog(false);
  const changeDialogType = (type: DialogType) => setDialogType(type);

  if (authStore.isAuth && !authStore.user && !isDialog) {
    authStore.getUserProfile();
  }

  return (
    <Box className='accountBox'>
      {!authStore.isAuth ? (
        <Box>
          <Button variant='contained' onClick={handleAuthOpen}>
            Войти
          </Button>
          <Dialog onClose={handleAuthClose} open={isDialog}>
            {dialogType === DialogType.SIGN_IN ? (
              <SignIn onSwitch={() => changeDialogType(DialogType.SIGN_UP)} onClose={handleAuthClose} />
            ) : (
              <SignUp onSwitch={() => changeDialogType(DialogType.SIGN_IN)} onClose={handleAuthClose} />
            )}
          </Dialog>
        </Box>
      ) : (
        <IconButton aria-haspopup='true' color='inherit' onClick={() => setOpen(true)}>
          <UserAvatar user={authStore.user} type={FileType.THUMBNAIL} />
        </IconButton>
      )}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <AccountSettings onClose={() => setOpen(false)} />
      </Dialog>
    </Box>
  );
});

interface AccountSettingsProps {
  onClose: () => void;
}
const AccountSettings: React.FC<AccountSettingsProps> = observer(({ onClose }) => {
  Logger.info('AccountSettings');

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

  const handleLogOut = () => {
    authStore.logOut();
    onClose();
  };

  return (
    <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center', width: SETTINGS_WIDTH }}>
      <IconButton>
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
      <Typography variant='subtitle1'>{authStore?.user?.email}</Typography>
      <Typography variant='body1'>Уровень {Math.ceil((authStore?.user?.experience ?? 1) / 5000)}</Typography>
      <Box sx={{ width: '100%', mt: 1 }}>
        <LinearProgress variant='determinate' value={(((authStore?.user?.experience ?? 1) / 5000) % 1) * 100} />
      </Box>
      <Divider sx={{ width: '100%', mt: 2, mb: 2 }} />
      <Button variant='outlined' onClick={handleLogOut}>
        Выйти
      </Button>
      <Divider sx={{ width: '100%', mt: 2, mb: 2 }} />
    </Paper>
  );
});
