import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Alert } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useForm } from 'react-hook-form';
import { materialColor } from '../../../../utils/MaterialColorGenerator';
import { authStore } from './../../../../store/auth.store';
import { errorStore } from './../../../../store/error.store';

type FormData = {
    username: string;
    email: string;
    password: string;
    repeatPassword: string;
};

interface SignUpProps {
    onSwitch: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSwitch }) => {
    const USERNAME_MIN_LENGTH = 4;
    const USERNAME_MAX_LENGTH = 30;
    const PASSWORD_MIN_LENGTH = 6;
    const PASSWORD_MAX_LENGTH = 40;

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm<FormData>();

    const onSubmit = handleSubmit(data => authStore.tryRegister(data.username, data.email, data.password, materialColor()));
    const password = React.useRef({});
    password.current = watch('password', '');

    return (
        <Container component='main' maxWidth='xs'>
            <Box sx={{ mt: 2, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component='h1' variant='h5'>
                    Зарегистрироваться
                </Typography>
                <Box component='form' onSubmit={onSubmit} sx={{ mt: 3 }} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                error={!!errors.username}
                                helperText={errors.username?.message ?? ''}
                                autoComplete='given-name'
                                required
                                fullWidth
                                label='Никнейм'
                                id='username'
                                autoFocus
                                {...register('username', {
                                    required: 'Необходимо указать никнейм',
                                    minLength: {
                                        value: USERNAME_MIN_LENGTH,
                                        message: `Никнейм должен содержать не менее ${USERNAME_MIN_LENGTH} символов`
                                    },
                                    maxLength: {
                                        value: USERNAME_MAX_LENGTH,
                                        message: `Никнейм должен содержать не более ${USERNAME_MAX_LENGTH} символов`
                                    }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                error={!!errors.email}
                                helperText={errors.email?.message ?? ''}
                                required
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
                                required
                                fullWidth
                                label='Пароль'
                                type='password'
                                id='password'
                                autoComplete='new-password'
                                {...register('password', {
                                    required: 'Необходимо указать пароль',
                                    minLength: {
                                        value: PASSWORD_MIN_LENGTH,
                                        message: `Пароль должен содержать не менее ${USERNAME_MIN_LENGTH} символов`
                                    },
                                    maxLength: {
                                        value: PASSWORD_MAX_LENGTH,
                                        message: `Пароль должен содержать не более ${PASSWORD_MAX_LENGTH} символов`
                                    }
                                })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                error={!!errors.repeatPassword}
                                helperText={errors.repeatPassword?.message ?? ''}
                                required
                                fullWidth
                                label='Подтверждение пароля'
                                type='password'
                                id='repeatPassword'
                                autoComplete='new-password'
                                {...register('repeatPassword', { validate: value => value === password.current || 'Пароли не совпадают' })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox value='allowExtraEmails' color='primary' />}
                                label='Я хочу получать вдохновение, маркетинговые акции и обновления по электронной почте.'
                            />
                        </Grid>
                    </Grid>
                    <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
                        Создать аккаунт
                    </Button>
                    <Grid container justifyContent='center'>
                        <Grid item>
                            <Link variant='body2' onClick={() => onSwitch()} style={{ cursor: 'pointer' }}>
                                Уже есть аккаунт? Войти
                            </Link>
                        </Grid>
                    </Grid>
                    {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
                </Box>
            </Box>
        </Container>
    );
};
