import AttachmentIcon from '@mui/icons-material/Attachment';
import Box from '@mui/material/Box';
import { observer, useLocalObservable } from 'mobx-react-lite';
import React from 'react';
import './styles/file-upload.scss';

interface FileUploadProps {
    onUpload: (files: File[]) => void;
}

interface ILocalStore {
    fileDragOver: boolean;
    files: File[];
}

export const FileUpload: React.FC<FileUploadProps> = observer(({ onUpload }) => {
    const localStore = useLocalObservable<ILocalStore>(() => ({
        fileDragOver: false,
        files: []
    }));

    const addFiles = (files: File[]) => {
        onUpload(files);
        localStore.files = files;
    };

    const uploadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files != null) {
            addFiles(Array.from(e.target.files));
        }
    };

    const dragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        localStore.fileDragOver = true;
    };

    const dragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        localStore.fileDragOver = false;
    };

    const drop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        addFiles(Array.from(e.dataTransfer.files));
        localStore.fileDragOver = false;
    };

    return (
        <Box sx={{ height: 90, mt: 3 }}>
            <div
                style={{ backgroundColor: localStore.fileDragOver ? '#b8eeff' : '' }}
                className='file-upload ccc'
                onDragLeave={dragLeave}
                onDrop={drop}
                onDragOver={dragOver}
            >
                <div className='rcc'>
                    {!localStore.fileDragOver && <AttachmentIcon />}
                    <div className='file-upload-text'>
                        {!localStore.fileDragOver ? 'Перетащите файлы для загрузки сюда или' : 'Отпустите файлы'}
                    </div>
                    <label htmlFor='file-upload' className='file-upload-ref'>
                        {' '}
                        загрузите
                    </label>
                    <input className='file-upload-ref-input' id='file-upload' type='file' onChange={uploadFiles} multiple />
                </div>
                {localStore.files.length != 0 && (
                    <div className='file-upload-files'>Загруженные: {localStore.files.map((f: any) => f.name).join(',  ')}</div>
                )}
            </div>
        </Box>
    );
});
