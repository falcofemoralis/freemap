import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Alert } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import { useForm } from 'react-hook-form';
import { Logger } from '../../../../misc/Logger';
import { authStore } from './../../../../store/auth.store';
import { errorStore } from './../../../../store/error.store';
import '../../styles/Auth.scss';

type FormData = {
  email: string;
  password: string;
};

interface SignInProps {
  onSwitch: () => void;
  onClose: () => void;
}

export const SignIn: React.FC<SignInProps> = ({ onSwitch, onClose }) => {
  Logger.info('SignIn');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>();
  const onSubmit = handleSubmit(async data => {
    await authStore.tryLogin(data.email, data.password);
    onClose();
  });

  const handleGoogleLogin = async (res: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    await authStore.tryGoogleLogin((res as GoogleLoginResponse).tokenId);
    onClose();
  };

  const handleGoogleFailure = (e: any) => {
    errorStore.errorHandle(e);
  };

  return (
    <Container component='main' maxWidth='xs'>
      <Box sx={{ mt: 2, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <ExitToAppIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          Авторизоваться
        </Typography>
        <Box component='form' onSubmit={onSubmit} sx={{ mt: 3 }} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                error={!!errors.email}
                helperText={errors.email?.message ?? ''}
                fullWidth
                id='email'
                label='Email'
                autoComplete='email'
                {...register('email', {
                  required: 'Необходимо указать email',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: `Некорректный email`
                  }
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!!errors.password}
                helperText={errors.password?.message ?? ''}
                fullWidth
                label='Пароль'
                type='password'
                id='password'
                autoComplete='new-password'
                {...register('password', { required: 'Необходимо указать пароль' })}
              />
            </Grid>
          </Grid>
          <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
            Войти
          </Button>
          <Grid container justifyContent='center' flexDirection='column' alignItems='center'>
            <Grid item>
              <GoogleLogin
                className='googleBtn'
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID as string}
                buttonText='Log in with Google'
                onSuccess={handleGoogleLogin}
                onFailure={handleGoogleFailure}
                cookiePolicy='single_host_origin'
              ></GoogleLogin>
            </Grid>
            <Grid item sx={{ mt: 2 }}>
              <Link variant='body2' onClick={() => onSwitch()} style={{ cursor: 'pointer' }}>
                Нету аккаунта? Создать
              </Link>
            </Grid>
          </Grid>
          {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};
