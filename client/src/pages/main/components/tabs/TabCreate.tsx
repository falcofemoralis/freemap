import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, Drawer } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FileUpload } from '../../../../components/FileUpload';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { errorStore } from '../../../../store/error.store';
import { DRAWER_WIDTH } from './index';
import { formatCoordinate, getCenter, toText } from '../../../../utils/CoordinatesUtil';

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

export const TabCreate: React.FC<TabCreateProps> = observer(({ onSubmit, onClose }) => {
    const [isLoading, setLoading] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormData>();

    const handleOnSubmit = handleSubmit(async data => {
        if (editorStore.selectedFeatureType && editorStore.newFeatureCoordinates && editorStore.newFeatureZoom) {
            setLoading(true);
            const addedFeature = await MapService.addFeature(
                {
                    id: '',
                    createdAt: -1,
                    type: editorStore.selectedFeatureType,
                    coordinates: editorStore.newFeatureCoordinates,
                    zoom: editorStore.newFeatureZoom,
                    ...data
                },
                files
            );

            editorStore.newFeature?.setProperties(addedFeature);

            reset();
            setLoading(false);
        }

        onSubmit();
    });

    const handleFilesChange = (data: File[]) => setFiles(data);

    const handleClose = () => {
        reset();
        setLoading(false);
        onClose();
    };

    return (
        <Drawer
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': { width: DRAWER_WIDTH, p: 3 }
            }}
            anchor='left'
            open={editorStore.isEditorTabOpen}
            onClose={handleClose}
        >
            <Box component='form' onSubmit={handleOnSubmit} sx={{ mt: 3 }} noValidate>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            disabled
                            fullWidth
                            id='coordinates'
                            label='Координаты'
                            defaultValue={
                                editorStore.newFeatureCoordinates && toText(formatCoordinate(getCenter(editorStore.newFeatureCoordinates)))
                            }
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
                    <Grid item xs={12}>
                        <FileUpload onUpload={handleFilesChange} />
                    </Grid>
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
                    <LoadingButton
                        onClick={handleOnSubmit}
                        endIcon={<SendIcon />}
                        loading={isLoading}
                        loadingPosition='end'
                        variant='contained'
                    >
                        Добавить
                    </LoadingButton>
                </Box>

                {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
            </Box>
        </Drawer>
    );
});
