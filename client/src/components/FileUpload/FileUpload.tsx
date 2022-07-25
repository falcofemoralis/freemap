import MapService from '@/services/map.service';
import { IMedia } from '@/types/IMedia';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import { IconButton, styled, Box, Button } from '@mui/material';
import { observer, useLocalObservable } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import './FileUpload.scss';

interface FileUploadProps {
  onUpload?: (files: File[]) => void;
  isSubmit?: boolean;
  submitId?: string;
  onSubmit?: (files: IMedia[]) => void;
}

interface ILocalStore {
  files: File[];
  isLoading: boolean;
}

const Input = styled('input')({
  display: 'none'
});

export const FileUpload: React.FC<FileUploadProps> = observer(({ onUpload, isSubmit, submitId, onSubmit }) => {
  const { t } = useTranslation();

  const localStore = useLocalObservable<ILocalStore>(() => ({
    files: [],
    isLoading: false
  }));

  const addFiles = (files: File[]) => {
    localStore.files.push(...files);
    if (onUpload) onUpload(localStore.files);
  };

  const uploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files != null) {
      addFiles(Array.from(e.target.files));
    }
  };

  const getFileSrc = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const handleSubmit = async () => {
    if (!submitId) {
      console.error('submitId WAS NOT PROVIDED IN FILEUPLOAD SUBMIT MODE');
      return;
    }

    localStore.isLoading = true;
    const uploaded = await MapService.addMedia(submitId, localStore.files);
    if (onSubmit) onSubmit(uploaded);
    localStore.files = [];
    localStore.isLoading = false;
  };

  return (
    <Box className='fileUpload'>
      <Box
        className='fileUpload__container'
        sx={{
          justifyContent: localStore.files.length == 0 ? 'center' : 'unset',
          overflowX: localStore.files.length > 0 ? 'scroll' : 'hidden'
        }}
      >
        <label htmlFor='contained-button-file'>
          <Input accept='image/*' id='contained-button-file' multiple type='file' onChange={uploadFiles} />
          {localStore.files.length == 0 ? (
            <Button variant='outlined' component='span' startIcon={<PhotoCamera />}>
              {t('ADD_PHOTOS')}
            </Button>
          ) : (
            <IconButton className='fileUpload__add' color='primary' aria-label='upload picture' component='span'>
              <PhotoCamera />
            </IconButton>
          )}
        </label>
        <Box className='fileUpload__files'>
          {localStore.files.map((file: File, index: number) => (
            <img className='fileUpload__img' key={index} src={getFileSrc(file)}></img>
          ))}
        </Box>
      </Box>
      {isSubmit && localStore.files.length > 0 && (
        <Box className='fileUpload__submit'>
          <LoadingButton onClick={handleSubmit} endIcon={<SendIcon />} loading={localStore.isLoading} loadingPosition='end' variant='contained'>
            {t('SUBMIT')}
          </LoadingButton>
        </Box>
      )}
    </Box>
  );
});
