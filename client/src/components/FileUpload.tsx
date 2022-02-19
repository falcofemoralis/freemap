import AttachmentIcon from '@mui/icons-material/Attachment';
import Box from '@mui/material/Box';
import { observer, useLocalObservable } from 'mobx-react-lite';
import React from 'react';
import './styles/file-upload.scss';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Button from '@mui/material/Button';
import styled from '@emotion/styled';
import { IconButton, Typography } from '@mui/material';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
}

interface ILocalStore {
    files: File[];
}

const Input = styled('input')({
    display: 'none'
});

export const FileUpload: React.FC<FileUploadProps> = observer(({ onUpload }) => {
    const localStore = useLocalObservable<ILocalStore>(() => ({
        files: []
    }));

    const addFiles = (files: File[]) => {
        localStore.files.push(...files);
        onUpload(localStore.files);
    };

    const uploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files != null) {
            addFiles(Array.from(e.target.files));
        }
    };

    const getFileSrc = (file: File): string => {
        return URL.createObjectURL(file);
    };

    return (
        <Box sx={{ display: 'flex', overflowX: localStore.files.length > 0 ? 'scroll' : 'hidden' }}>
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
    );
});
