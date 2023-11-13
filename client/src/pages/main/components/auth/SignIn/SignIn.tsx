import { authStore } from '@/store/auth.store';
import { errorStore } from '@/store/error.store';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Alert, Avatar, Box, Button, Container, Grid, Link, TextField, Typography } from '@mui/material';
import React from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import './SignIn.scss';

interface FormData {
  email: string;
  password: string;
}
interface SignInProps {
  onSwitch: () => void;
  onClose: () => void;
}
export const SignIn: React.FC<SignInProps> = ({ onSwitch, onClose }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();

  const emailForm = {
    required: t('EMAIL_REQUIRED'),
    pattern: {
      value: /^\S+@\S+$/i,
      message: t('EMAIL_INCORRECT')
    }
  };
  const passwordForm = { required: t('PASSWORD_REQUIRED') };

  /**
   * Handle auth via site login
   */
  const onSubmit = handleSubmit(async data => {
    await authStore.tryLogin(data.email, data.password);
    onClose();
  });

  /**
   * Handle auth via google login
   */
  const handleGoogleLogin = async (res: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    await authStore.tryGoogleLogin((res as GoogleLoginResponse).tokenId);
    onClose();
  };

  /**
   * Handle google login fail
   */
  const handleGoogleFailure = (e: any) => {
    errorStore.errorHandle(e);
  };

  return (
    <Container maxWidth='xs'>
      <Box className='signIn'>
        <Avatar className='signIn__icon'>
          <ExitToAppIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          {t('SIGN_IN')}
        </Typography>
        <Box className='signIn__form' component='form' onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                error={!!errors.email}
                helperText={errors.email?.message ?? ''}
                fullWidth
                id='email'
                label={t('EMAIL')}
                autoComplete='email'
                {...register('email', emailForm)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!!errors.password}
                helperText={errors.password?.message ?? ''}
                fullWidth
                label={t('PASSWORD')}
                type='password'
                id='password'
                autoComplete='new-password'
                {...register('password', passwordForm)}
              />
            </Grid>
          </Grid>
          <Button className='signIn__submit' type='submit' fullWidth variant='contained'>
            {t('SIGN_IN')}
          </Button>
          <Grid container justifyContent='center' flexDirection='column' alignItems='center'>
            <Grid item>
              <GoogleLogin
                className='signIn__googleBtn'
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}
                buttonText={t('GOOGLE_SIGN_IN')}
                onSuccess={handleGoogleLogin}
                onFailure={handleGoogleFailure}
                cookiePolicy='single_host_origin'
              />
            </Grid>
            <Grid className='signIn__account' item>
              <Link className='signIn__accountBtn' variant='body2' onClick={onSwitch}>
                {t('NO_ACCOUNT_HINT')}
              </Link>
            </Grid>
          </Grid>
          {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};
