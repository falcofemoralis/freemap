import { GeometryConstant } from '@/constants/geometry.type';
import { editorStore } from '@/store/editor.store';
import HighlightAltOutlinedIcon from '@mui/icons-material/HighlightAltOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LinearScaleOutlinedIcon from '@mui/icons-material/LinearScaleOutlined';
import { IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { GeometryType } from '@/types/IMapData';

interface EditorPanelProps {
  onSelect: (type: GeometryType) => void;
}
export const EditorPanel: React.FC<EditorPanelProps> = observer(({ onSelect }) => {
  return (
    <>
      <IconButton className='editorBtn' size='large' onClick={() => onSelect(GeometryConstant.POLYGON)} disabled={editorStore.isDrawing}>
        <HomeWorkOutlinedIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={() => onSelect(GeometryConstant.MULTI_LINE_STRING)} disabled={editorStore.isDrawing}>
        <LinearScaleOutlinedIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={() => onSelect(GeometryConstant.MULTI_POLYGON)} disabled={editorStore.isDrawing}>
        <HighlightAltOutlinedIcon />
      </IconButton>
    </>
  );
});
