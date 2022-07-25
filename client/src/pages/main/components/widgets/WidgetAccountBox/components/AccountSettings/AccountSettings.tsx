import { UserAvatar } from '@/components/UserAvatar/UserAvatar';
import { authStore } from '@/store/auth.store';
import { Box, Button, CircularProgress, Divider, IconButton, LinearProgress, Paper, styled, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { XP_PER_LVL } from '@/constants/level.constants';
import './AccountSettings.scss';

interface AccountSettingsProps {
  onClose: () => void;
}
export const AccountSettings: React.FC<AccountSettingsProps> = observer(({ onClose }) => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const Input = styled('input')({
    display: 'none'
  });

  /**
   * Handle avatar update
   * @param e - event with uploaded file
   */
  const onImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setLoading(true);
      await authStore.updateUserAvatar(files[0]);
      setLoading(false);
    }
  };

  /**
   * Get current user lvl
   * @returns user level
   */
  const getLvl = () => {
    return Math.ceil((authStore?.user?.experience ?? 1) / XP_PER_LVL);
  };

  /**
   * Get user lvl progress till next level
   * @returns current level progress
   */
  const getLvlProgress = () => {
    return (((authStore?.user?.experience ?? 1) / XP_PER_LVL) % 1) * 100;
  };

  /**
   * Handle log out
   */
  const handleLogOut = () => {
    authStore.logOut();
    onClose();
  };

  return (
    <Paper className='accountSettings'>
      <IconButton>
        {loading ? (
          <CircularProgress />
        ) : (
          <label htmlFor='contained-button-file'>
            <Input id='contained-button-file' accept='image/*' type='file' onChange={onImgUpload} />
            <UserAvatar className='accountSettings__avatar' user={authStore.user} />
          </label>
        )}
      </IconButton>
      <Typography className='accountSettings__username' variant='h4'>
        {authStore?.user?.username}
      </Typography>
      <Typography variant='subtitle1'>{authStore?.user?.email}</Typography>
      <Typography variant='body1'>
        {t('LEVEL')} {getLvl()}
      </Typography>
      <Box className='accountSettings__progress'>
        <LinearProgress variant='determinate' value={getLvlProgress()} />
      </Box>
      <Divider className='accountSettings__divider' />
      <Button variant='outlined' onClick={handleLogOut}>
        {t('LOG_OUT')}
      </Button>
      <Divider className='accountSettings__divider' />
    </Paper>
  );
});
