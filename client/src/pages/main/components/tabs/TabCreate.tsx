import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, Button, Dialog, Divider, Drawer, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MuiPhoneNumber from 'material-ui-phone-number';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { FileUpload } from '../../../../components/FileUpload';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { errorStore } from '../../../../store/error.store';
import { formatCoordinate, getCenter, toText } from '../../../../utils/CoordinatesUtil';
import { DRAWER_WIDTH } from './index';
import DeleteIcon from '@mui/icons-material/Delete';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';

type FormData = {
    name: string;
    description: string;
    address: string;
    links: string;
    category: string;
};

interface TabCreateProps {
    onSubmit: () => void;
    onClose: () => void;
}

export const TabCreate: React.FC<TabCreateProps> = observer(({ onSubmit, onClose }) => {
    const [isLoading, setLoading] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);
    const [links, setLinks] = React.useState<string[]>([]);

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
            <Box component='form' onSubmit={handleOnSubmit} noValidate>
                <Grid container spacing={2}>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography component='span' variant='h5'>
                            Добавить место
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography component='span' variant='h6'>
                                Place details
                            </Typography>
                            <Typography component='span' variant='subtitle2'>
                                Provide some information about this place. If this place is added to Maps, it will appear publicly.
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            error={!!errors.name}
                            helperText={errors.name?.message ?? ''}
                            fullWidth
                            required
                            id='name'
                            label='Имя'
                            {...register('name', { required: 'Необходимо указать имя' })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            error={!!errors.category}
                            helperText={errors.category?.message ?? ''}
                            fullWidth
                            required
                            id='category'
                            label='Категория'
                            {...register('category', { required: 'Необходимо выбрать категорию' })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            multiline
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
                            required
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
                        <Typography component='span' variant='h6'>
                            Контакты
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth id='address' label='Адрес' />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth id='phone' label='Телефон' />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth id='wiki' label='Wikipedia' />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            id='tags-filled'
                            options={links}
                            freeSolo
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <div key={option}>
                                        <Chip variant='outlined' label={option} {...getTagProps({ index })} />
                                    </div>
                                ))
                            }
                            renderInput={params => <TextField {...params} variant='outlined' label='Ссылки' placeholder='Url' />}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography component='span' variant='h6'>
                                Place photos
                            </Typography>
                            <Typography component='span' variant='subtitle2'>
                                Add helpful photos like storefronts, notices, or signs
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <FileUpload onUpload={handleFilesChange} />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Divider />
                            <Typography component='span' variant='subtitle2' sx={{ mt: 3 }}>
                                Google will email you about the status of your edits.
                            </Typography>
                        </Box>
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
