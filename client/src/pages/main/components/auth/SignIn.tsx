import * as React from 'react';
import { FC } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useForm } from 'react-hook-form';
import { Alert } from '@mui/material';
import { errorStore } from './../../../../store/error.store';
import { authStore } from './../../../../store/auth.store';

type FormData = {
    email: string;
    password: string;
};

interface SignInProps {
    onSwitch: () => void;
}

export const SignIn: FC<SignInProps> = ({ onSwitch }) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>();
    const onSubmit = handleSubmit(data => authStore.tryLogin(data.email, data.password));

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
                    <Grid container justifyContent='center'>
                        <Grid item>
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
