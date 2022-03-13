import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, Divider, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Feature, Geometry, LineString, Polygon, Position } from 'geojson';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { AutocompleteType } from '../../../../components/AutocompleteType';
import { CustomDrawer } from '../../../../components/CustomDrawer';
import { FileUpload } from '../../../../components/FileUpload';
import { GeometryType } from '../../../../constants/geometry.type';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { errorStore } from '../../../../store/error.store';
import { Coordinates } from '../../../../types/IMapFeature';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import { getCenter, toText } from '../../../../misc/CoordinatesUtils';
import { MapContext } from '../../../../MapProvider';
import { GeoJSONSource } from 'mapbox-gl';
import { FeatureProps } from '../../../../types/IMapData';
import { mapStore } from '../../../../store/map.store';

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
  const { mainMap } = React.useContext(MapContext);
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

  /**
   * Отправка созданного объекта на сервер
   */
  const handleOnSubmit = handleSubmit(async data => {
    if (!editorStore.createdFeature?.type && !selectedType) {
      setErrorData({ ...errorData, type: 'Необходимо выбрать категорию' });
      return;
    }

    if (!editorStore.createdFeature?.coordinates) {
      setErrorData({ ...errorData, coordinates: 'Отсутствуют координаты. Ошибка?' });
      return;
    }

    setLoading(true);

    try {
      if (editorStore.createdFeature?.coordinates && editorStore.createdFeature?.type) {
        const { id, name, createdAt, category, type, coordinates } = await MapService.addFeature(
          {
            coordinates: editorStore.createdFeature?.coordinates,
            type: editorStore.createdFeature?.type,
            links,
            ...data
          },
          files
        );

        const feature: Feature<Geometry, FeatureProps> = {
          type: 'Feature',
          properties: { id, name, createdAt, category },
          geometry: {
            type: type.geometry,
            coordinates: coordinates as any
          },
          id: new Date().getTime()
        };
        const collection = mapStore.addFeature(type.id, feature);
        if (data) {
          (mainMap?.getSource(type.id) as GeoJSONSource).setData(collection as any);
        }

        reset();
        resetData();
        onSubmit();
      }
    } catch (e) {
      console.error(e);
      resetData();
    }
  });

  /**
   * Ресет веденных данных
   */
  const resetData = () => {
    setFiles([]);
    setLinks([]);
    setSelectedType(null);
    setLoading(false);
  };

  /**
   * Закрытия вкладки создания
   */
  const handleClose = () => {
    reset();
    resetData();
    onClose();
  };

  const handleFilesChange = (data: File[]) => setFiles(data);
  const handleFeatureTypeSelect = (type: IMapFeatureType | null) => setSelectedType(type);
  const handleLinksChange = (links: string[]) => setLinks(links);

  return (
    <CustomDrawer open={editorStore.isFeature} onClose={handleClose}>
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
              featureTypes={editorStore.featureTypes ?? []}
              selectedGeometry={editorStore.isFeature ? editorStore.createdFeature?.type?.geometry : null}
              selectedType={editorStore.isFeature ? editorStore.createdFeature?.type : null}
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
              defaultValue={editorStore.isFeature && toText(getCenter(editorStore.createdFeature?.coordinates, editorStore.createdFeature?.type?.geometry))}
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
          <LoadingButton onClick={handleOnSubmit} endIcon={<SendIcon />} loading={isLoading} loadingPosition='end' variant='contained'>
            Добавить
          </LoadingButton>
        </Box>

        {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
      </Box>
    </CustomDrawer>
  );
});
