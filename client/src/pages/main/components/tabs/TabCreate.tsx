import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, Divider, Drawer, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AutocompleteType } from '../../../../components/AutocompleteType';
import { FileUpload } from '../../../../components/FileUpload';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { errorStore } from '../../../../store/error.store';
import { mapStore } from '../../../../store/map.store';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import { formatCoordinate, getCenter, toText } from '../../../../utils/CoordinatesUtil';
import { DRAWER_WIDTH } from './index';

type FormData = {
    name: string;
    description: string;
    address: string;
    phone: string;
    wiki: string;
};

interface ErrorData {
    coordinates: string;
    type: string;
}

interface TabCreateProps {
    onSubmit: () => void;
    onClose: () => void;
}

export const TabCreate: React.FC<TabCreateProps> = observer(({ onSubmit, onClose }) => {
    const [isLoading, setLoading] = React.useState(false);
    const [files, setFiles] = React.useState<File[]>([]);
    const [links, setLinks] = React.useState<string[]>([]);
    const [selectedType, setSelectedType] = React.useState<IMapFeatureType | null>(null);
    const [errorData, setErrorData] = React.useState<ErrorData>({ coordinates: '', type: '' });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormData>();

    const handleOnSubmit = handleSubmit(async data => {
        if (!editorStore.selectedFeatureType && !selectedType) {
            setErrorData({ ...errorData, type: 'Необходимо выбрать категорию' });
            return;
        }

        if (!editorStore.newFeatureCoordinates || !editorStore.newFeatureZoom) {
            setErrorData({ ...errorData, coordinates: 'Отсутствуют координаты. Ошибка?' });
            return;
        }

        if (editorStore.selectedFeatureType && editorStore.newFeatureCoordinates && editorStore.newFeatureZoom) {
            setLoading(true);

            try {
                const addedFeature = await MapService.addFeature(
                    {
                        id: '',
                        createdAt: -1,
                        type: selectedType ? selectedType : editorStore.selectedFeatureType,
                        coordinates: editorStore.newFeatureCoordinates,
                        zoom: editorStore.newFeatureZoom,
                        links,
                        ...data
                    },
                    files
                );

                editorStore.newFeature?.setProperties(addedFeature);

                reset();
                resetData();
                onSubmit();
            } catch (e) {
                console.log(e);
                resetData();
            }
        }
    });

    const resetData = () => {
        setFiles([]);
        setLinks([]);
        setSelectedType(null);
        setLoading(false);
    };

    const handleClose = () => {
        reset();
        resetData();
        onClose();
    };

    const handleFilesChange = (data: File[]) => setFiles(data);
    const handleFeatureTypeSelect = (type: IMapFeatureType | null) => setSelectedType(type);
    const handleLinksChange = (links: string[]) => setLinks(links);

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
                            multiline
                            error={!!errors.description}
                            helperText={errors.description?.message ?? ''}
                            fullWidth
                            id='description'
                            label='Описание'
                            {...register('description', { required: 'Необходимо выбрать описание' })}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <AutocompleteType
                            error={Boolean(errorData.type)}
                            helperText={errorData.type}
                            onChange={handleFeatureTypeSelect}
                            featureTypes={mapStore.featureTypes}
                            selectedGeometry={editorStore.selectedFeatureType?.geometry}
                            selectedType={editorStore.selectedFeatureType}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            error={Boolean(errorData.coordinates)}
                            helperText={errorData.coordinates}
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
                        <TextField fullWidth id='address' label='Адрес' {...register('address')} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth id='phone' label='Телефон' {...register('phone')} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth id='wiki' label='Wikipedia' {...register('wiki')} />
                    </Grid>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            id='tags-filled'
                            options={links}
                            onChange={(event, value) => handleLinksChange(value)}
                            freeSolo
                            renderTags={(value: readonly string[], getTagProps) =>
                                value.map((option: string, index: number) => (
                                    <div key={option} style={{ maxWidth: '100%' }}>
                                        <Chip variant='outlined' label={option} {...getTagProps({ index })} />
                                    </div>
                                ))
                            }
                            renderInput={params => <TextField {...params} variant='outlined' label='Ссылки' placeholder='url' />}
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

// interface TypeFieldProps {
//     onChange: (type: IMapFeatureType | null) => void;
// }
// const TypeField: React.FC<TypeFieldProps> = ({ onChange }) => {
//     return (

//     );
// };
