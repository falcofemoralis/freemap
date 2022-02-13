import { Drawer, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { errorStore } from '../../../../store/error.store';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { authStore } from '../../../../store/auth.store';
import { EditSharp } from '@mui/icons-material';
import { editorStore } from '../../../../store/editor.store';
import { mapStore } from '../../../../store/map.store';
import MapService from '../../../../services/map.service';

const drawerWidth = 324;

type FormData = {
    name: string;
    description: string;
    address: string;
    links: string;
};

interface TabCreateProps {
    onSubmit: () => void;
    onClose: () => void;
}

export const TabCreate: FC<TabCreateProps> = ({ onSubmit, onClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>();

    const handleOnSubmit = handleSubmit(async data => {
        if (editorStore.selectedFeatureType && editorStore.coordinates && editorStore.zoom) {
            const addedFeature = await MapService.addFeature({
                type: editorStore.selectedFeatureType,
                coordinates: editorStore.coordinates,
                zoom: editorStore.zoom,
                ...data
            });

            editorStore.newFeature?.setProperties(addedFeature);
        }

        onSubmit();
    });

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: drawerWidth, p: 3 }
            }}
            anchor='left'
            open={true}
            onClose={onClose}
        >
            <Box component='form' onSubmit={handleOnSubmit} sx={{ mt: 3 }} noValidate>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField disabled fullWidth id='coordinates' label='Координаты' defaultValue={editorStore.coordinates} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            error={!!errors.name}
                            helperText={errors.name?.message ?? ''}
                            fullWidth
                            id='name'
                            label='Имя'
                            {...register('name', { required: 'Необходимо указать имя' })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            error={!!errors.description}
                            helperText={errors.description?.message ?? ''}
                            fullWidth
                            id='description'
                            label='Описание'
                            {...register('description', { required: 'Необходимо указать описание' })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            error={!!errors.address}
                            helperText={errors.address?.message ?? ''}
                            fullWidth
                            id='address'
                            label='Адрес'
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField error={!!errors.links} helperText={errors.links?.message ?? ''} fullWidth id='links' label='Ссылки' />
                    </Grid>
                </Grid>
                <Button type='submit' fullWidth variant='contained' sx={{ mt: 3, mb: 2 }}>
                    Добавить
                </Button>
                {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
            </Box>
        </Drawer>
    );
};
