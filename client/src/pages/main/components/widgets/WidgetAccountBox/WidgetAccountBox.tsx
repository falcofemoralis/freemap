import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { FileType } from '@/constants/file.type';
import { authStore } from '@/store/auth.store';
import { Box, Button, Dialog, Fade, IconButton, Paper, Popper } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignIn } from '../../auth/SignIn/SignIn';
import { SignUp } from '../../auth/SignUp/SignUp';
import { AccountSettings } from './components/AccountSettings/AccountSettings';
import './WidgetAccountBox.scss';

enum DialogType {
  SIGN_UP,
  SIGN_IN
}

export const WidgetAccountBox = observer(() => {
  const { t } = useTranslation();

  const [currentDialog, setCurrentDialog] = useState<DialogType>(DialogType.SIGN_IN);
  const [isDialog, setDialog] = useState(false);
  const handleAuthOpen = () => setDialog(true);
  const handleAuthClose = () => setDialog(false);

  const [accountOpen, setAccountOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  /**
   * Handle account settings open
   * @param event - event with current target element
   */
  const handleClick = (event?: React.MouseEvent<HTMLButtonElement>) => {
    if (!accountOpen && event) {
      setAnchorEl(event.currentTarget);
      setAccountOpen(true);
    } else {
      setAnchorEl(null);
      setAccountOpen(false);
    }
  };

  return (
    <Box className='accountBox'>
      {authStore.isAuth ? (
        <IconButton aria-haspopup='true' color='inherit' onClick={handleClick}>
          <UserAvatar user={authStore.user} type={FileType.THUMBNAIL} />
        </IconButton>
      ) : (
        <Box>
          <Button variant='contained' onClick={handleAuthOpen}>
            {t('SIGN_IN')}
          </Button>
          <Dialog onClose={handleAuthClose} open={isDialog}>
            {currentDialog === DialogType.SIGN_IN ? (
              <SignIn onSwitch={() => setCurrentDialog(DialogType.SIGN_UP)} onClose={handleAuthClose} />
            ) : (
              <SignUp onSwitch={() => setCurrentDialog(DialogType.SIGN_IN)} onClose={handleAuthClose} />
            )}
          </Dialog>
        </Box>
      )}
      <Popper open={accountOpen} anchorEl={anchorEl} placement='bottom-start' transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <AccountSettings onClose={handleClick} />
            </Paper>
          </Fade>
        )}
      </Popper>
    </Box>
  );
});
