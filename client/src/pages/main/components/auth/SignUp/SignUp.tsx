import { authStore } from '@/store/auth.store';
import { errorStore } from '@/store/error.store';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert, Avatar, Box, Button, Checkbox, Container, FormControlLabel, Grid, Link, TextField, Typography } from '@mui/material';
import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import './SignUp.scss';

type FormData = {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  isMailing: boolean;
};
interface SignUpProps {
  onSwitch: () => void;
  onClose: () => void;
}
export const SignUp: React.FC<SignUpProps> = ({ onSwitch, onClose }) => {
  const USERNAME_MIN_LENGTH = 4;
  const USERNAME_MAX_LENGTH = 30;
  const PASSWORD_MIN_LENGTH = 6;
  const PASSWORD_MAX_LENGTH = 40;

  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<FormData>();

  const password = useRef({});
  password.current = watch('password', '');

  const nickNameForm = {
    required: t('NICKNAME_REQUIRED'),
    minLength: {
      value: USERNAME_MIN_LENGTH,
      message: `${t('NICKNAME_AT_LEAST')} ${USERNAME_MIN_LENGTH} ${t('SYMBOLS')}`
    },
    maxLength: {
      value: USERNAME_MAX_LENGTH,
      message: `${t('NICKNAME_MORE_THAN')} ${USERNAME_MAX_LENGTH} ${t('SYMBOLS')}`
    }
  };
  const emailForm = {
    required: t('EMAIL_REQUIRED'),
    pattern: {
      value: /^\S+@\S+$/i,
      message: t('EMAIL_INCORRECT')
    }
  };
  const passwordForm = {
    required: t('PASSWORD_REQUIRED'),
    minLength: {
      value: PASSWORD_MIN_LENGTH,
      message: `${t('PASSWORD_AT_LEAST')} ${USERNAME_MIN_LENGTH} ${t('SYMBOLS')}`
    },
    maxLength: {
      value: PASSWORD_MAX_LENGTH,
      message: `${t('PASSWORD_MORE_THAN')} ${PASSWORD_MAX_LENGTH} ${t('SYMBOLS')}`
    }
  };
  const repeatPasswordForm = { validate: (value: string) => value === password.current || t('PASSWORD_INCORRECT') };

  /**
   * Handle register via site login
   */
  const onSubmit = handleSubmit(async data => {
    await authStore.tryRegister(data.username, data.email, data.password, Boolean(data.isMailing));
    onClose;
  });

  return (
    <Container component='main' maxWidth='xs'>
      <Box className='signUp'>
        <Avatar className='signUp__icon'>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          {t('SIGN_UP')}
        </Typography>
        <Box className='signUp__form' component='form' onSubmit={onSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                error={!!errors.username}
                helperText={errors.username?.message ?? ''}
                required
                fullWidth
                label={t('NICKNAME')}
                id='username'
                autoFocus
                autoComplete='given-name'
                {...register('username', nickNameForm)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!!errors.email}
                helperText={errors.email?.message ?? ''}
                required
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
                required
                fullWidth
                label={t('PASSWORD')}
                type='password'
                id='password'
                autoComplete='new-password'
                {...register('password', passwordForm)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                error={!!errors.repeatPassword}
                helperText={errors.repeatPassword?.message ?? ''}
                required
                fullWidth
                label={t('PASSWORD_CONFIRM')}
                type='password'
                id='repeatPassword'
                autoComplete='new-password'
                {...register('repeatPassword', repeatPasswordForm)}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Checkbox value='allowExtraEmails' color='primary' {...register('isMailing')} />} label={t('IS_MAILING_HINT')} />
            </Grid>
          </Grid>
          <Button className='signUp__submit' type='submit' fullWidth variant='contained'>
            {t('SIGN_UP')}
          </Button>
          <Grid container justifyContent='center'>
            <Grid className='signUp__account' item>
              <Link className='signUp__accountBtn' variant='body2' onClick={onSwitch}>
                {t('ACCOUNT_EXIST_HINT')}
              </Link>
            </Grid>
          </Grid>
          {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};
