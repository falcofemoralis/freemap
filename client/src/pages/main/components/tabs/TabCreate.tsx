import { Alert, Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { errorStore } from '../../../../store/error.store';

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

export const TabCreate: FC<TabCreateProps> = observer(({ onSubmit, onClose }) => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>();

    const handleOnSubmit = handleSubmit(async data => {
        if (editorStore.selectedFeatureType && editorStore.newFeatureCoordinates && editorStore.newFeatureZoom) {
            const addedFeature = await MapService.addFeature({
                type: editorStore.selectedFeatureType,
                coordinates: editorStore.newFeatureCoordinates,
                zoom: editorStore.newFeatureZoom,
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
            open={editorStore.isEditorTabOpen}
            onClose={onClose}
        >
            <Box component='form' onSubmit={handleOnSubmit} sx={{ mt: 3 }} noValidate>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            disabled
                            fullWidth
                            id='coordinates'
                            label='Координаты'
                            defaultValue={editorStore.newFeatureCoordinates}
                        />
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
});
