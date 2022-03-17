import styled from '@emotion/styled';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { observer, useLocalObservable } from 'mobx-react-lite';
import React from 'react';
import SendIcon from '@mui/icons-material/Send';
import LoadingButton from '@mui/lab/LoadingButton';
import MapService from '../services/map.service';
import './styles/file-upload.scss';
import { IMedia } from '../types/IMedia';

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
    <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: localStore.files.length == 0 ? 'center' : 'unset',
          overflowX: localStore.files.length > 0 ? 'scroll' : 'hidden'
        }}
      >
        <label htmlFor='contained-button-file'>
          <Input accept='image/*' id='contained-button-file' multiple type='file' onChange={uploadFiles} />
          {localStore.files.length == 0 ? (
            <Button variant='outlined' component='span' startIcon={<PhotoCamera />}>
              Add photos
            </Button>
          ) : (
            <IconButton className='file-upload-btn' color='primary' aria-label='upload picture' component='span'>
              <PhotoCamera />
            </IconButton>
          )}
        </label>
        <Box sx={{ display: 'flex' }}>
          {localStore.files.map((file: File, index: number) => (
            <img className='file-upload-img' key={index} src={getFileSrc(file)}></img>
          ))}
        </Box>
      </Box>
      {isSubmit && localStore.files.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
          <LoadingButton onClick={handleSubmit} endIcon={<SendIcon />} loading={localStore.isLoading} loadingPosition='end' variant='contained'>
            Добавить
          </LoadingButton>
        </Box>
      )}
    </Box>
  );
});
