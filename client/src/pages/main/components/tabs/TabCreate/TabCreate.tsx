import { FeatureTypesAutocomplete } from '@/components/AutocompleteType/AutocompleteType';
import { CustomDrawer } from '@/components/CustomDrawer/CustomDrawer';
import { FileUpload } from '@/components/FileUpload/FileUpload';
import { MapContext } from '@/MapContext';
import MapService from '@/services/map.service';
import { editorStore } from '@/store/editor.store';
import { errorStore } from '@/store/error.store';
import { mapStore } from '@/store/map.store';
import { ICategory } from '@/types/ICategory';
import { FeatureProps } from '@/types/IMapData';
import { IMapFeatureType } from '@/types/IMapFeatureType';
import { getCenter, toText } from '@/utils/CoordinatesUtils';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { Alert, Divider, Typography, Autocomplete, Box, Chip, Grid, TextField } from '@mui/material';
import { Feature, Geometry } from 'geojson';
import { GeoJSONSource } from 'mapbox-gl';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import React, { useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { CategoriesAutocomplete } from './components/CategoriesAutocomplete/CategoriesAutocomplete';
import './TabCreate.scss';

interface FormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  wiki: string;
}
interface ErrorData {
  coordinates: string;
  type: string;
}
interface TabCreateProps {
  onSubmit: () => void;
  onClose: () => void;
}
export const TabCreate: React.FC<TabCreateProps> = observer(({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const { mainMap } = useContext(MapContext);

  const [isLoading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<IMapFeatureType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ICategory>();
  const [errorData, setErrorData] = useState<ErrorData>({ coordinates: '', type: '' });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>();

  const nameForm = { required: t('NAME_REQUIRED') };
  const descriptionForm = { required: t('DESCRIPTION_REQUIRED') };

  /**
   * Send created object to the server
   */
  const handleOnSubmit = handleSubmit(async data => {
    if (!editorStore.createdFeature?.type || !selectedType) {
      setErrorData({ ...errorData, type: t('CATEGORY_REQUIRED') });
      return;
    }

    if (!editorStore.createdFeature?.coordinates) {
      setErrorData({ ...errorData, coordinates: t('COORDINATES_REQUIRED') });
      return;
    }

    setLoading(true);

    try {
      const createdFeature = {
        coordinates: editorStore.createdFeature?.coordinates,
        type: selectedType ? selectedType : editorStore.createdFeature?.type,
        category: selectedCategory,
        links,
        ...data
      };

      const { id, name, createdAt, category, type, coordinates } = await MapService.addFeature(createdFeature, files);

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
    } catch (e) {
      console.error(e);
      resetData();
    }
  });

  /**
   * Reset form data
   */
  const resetData = () => {
    setFiles([]);
    setLinks([]);
    setSelectedType(null);
    setLoading(false);
    setSelectedCategory(undefined);
  };

  /**
   * Handle drawer close
   */
  const handleClose = () => {
    reset();
    resetData();
    onClose();
  };

  /**
   * Get feature coordinates as plain text
   */
  const getCoordinatesAsText = () => {
    const feature = toJS(editorStore.createdFeature);
    editorStore.isFeature && toText(getCenter(feature?.coordinates, feature?.type?.geometry));
  };

  const handleFilesChange = (data: File[]) => setFiles(data);
  const handleFeatureTypeSelect = (type: IMapFeatureType | null) => setSelectedType(type);
  const handleLinksChange = (links: string[]) => setLinks(links);
  const handleCategorySelect = (category: ICategory) => setSelectedCategory(category);

  return (
    <CustomDrawer open={editorStore.isFeature} onClose={handleClose}>
      <Box component='form' onSubmit={handleOnSubmit} noValidate>
        <Grid container spacing={2}>
          <Grid className='tabCreate__item' item xs={12}>
            <Typography component='span' variant='h5'>
              {t('ADD_PLACE')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Box className='tabCreate__input'>
              <Typography component='span' variant='h6'>
                {t('PLACE_DETAILS')}
              </Typography>
              <Typography component='span' variant='subtitle2'>
                {t('PLACE_DETAILS_HINT')}
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
              label={t('NAME')}
              {...register('name', nameForm)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              multiline
              error={!!errors.description}
              helperText={errors.description?.message ?? ''}
              required
              fullWidth
              id='description'
              label={t('DESCRIPTION')}
              {...register('description', descriptionForm)}
            />
          </Grid>
          <Grid item xs={12}>
            <FeatureTypesAutocomplete
              error={Boolean(errorData.type)}
              helperText={errorData.type}
              onChange={handleFeatureTypeSelect}
              selectedGeometry={editorStore.createdFeature?.type?.geometry}
              selectedType={editorStore.createdFeature?.type}
            />
          </Grid>
          <Grid item xs={12}>
            <CategoriesAutocomplete errorText={errorData.type} onChange={handleCategorySelect} />
          </Grid>
          <Grid item xs={12}>
            <TextField
              error={Boolean(errorData.coordinates)}
              helperText={errorData.coordinates}
              required
              disabled
              fullWidth
              id='coordinates'
              label={t('COORDINATES')}
              defaultValue={getCoordinatesAsText()}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography component='span' variant='h6'>
              {t('CONTACTS')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth id='address' label={t('ADDRESS')} {...register('address')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth id='phone' label={t('PHONE')} {...register('phone')} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth id='wiki' label={t('WIKI')} {...register('wiki')} />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              options={links}
              onChange={(_, value) => handleLinksChange(value)}
              freeSolo
              renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <div key={option} style={{ maxWidth: '100%' }}>
                    <Chip variant='outlined' label={option} {...getTagProps({ index })} />
                  </div>
                ))
              }
              renderInput={params => <TextField {...params} variant='outlined' label={t('LINKS')} placeholder='url' />}
            />
          </Grid>
          <Grid item xs={12}>
            <Box className='tabCreate__input'>
              <Typography component='span' variant='h6'>
                {t('PLACE_PHOTOS')}
              </Typography>
              <Typography component='span' variant='subtitle2'>
                {t('PLACE_PHOTOS_HINT')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FileUpload onUpload={handleFilesChange} />
          </Grid>
          <Grid item xs={12}>
            <Box className='tabCreate__input'>
              <Divider />
              <Typography component='span' variant='subtitle2' sx={{ mt: 3 }}>
                {t('EMAIL_HINT')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Box className='tabCreate__submit'>
          <LoadingButton onClick={handleOnSubmit} endIcon={<SendIcon />} loading={isLoading} loadingPosition='end' variant='contained'>
            {t('SUBMIT')}
          </LoadingButton>
        </Box>
        {errorStore.message && <Alert severity='error'>{errorStore.message}</Alert>}
      </Box>
    </CustomDrawer>
  );
});
