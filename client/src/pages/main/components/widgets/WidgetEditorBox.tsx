import HighlightAltOutlinedIcon from '@mui/icons-material/HighlightAltOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LinearScaleOutlinedIcon from '@mui/icons-material/LinearScaleOutlined';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { FeatureTypesAutocomplete } from '../../../../components/AutocompleteType';
import { GeometryType } from '../../../../constants/geometry.type';
import { authStore } from '../../../../store/auth.store';
import { editorStore } from '../../../../store/editor.store';
import { ICreatedMapFeature } from '../../../../types/IMapFeature';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import '../../styles/Widget.scss';
import { LayerDraw } from '../layers/LayerDraw';
import { TabCreate } from '../tabs/TabCreate';
import { Logger } from '../../../../misc/Logger';

export const WidgetEditorBox = () => {
  Logger.info('WidgetEditorBox');

  const [alert, setAlert] = React.useState(false);

  const handleEditTypeSelect = (type: GeometryType | null) => {
    if (!authStore.isAuth) {
      setAlert(true);
      return;
    }

    editorStore.setSelectedEditType(type);
  };

  const handleFeatureTypeSelect = (type: IMapFeatureType | null) => {
    editorStore.setSelectedFeatureType(type);
  };
  const onFeatureTypeApply = () => {
    // check if featureType was select in onChange
    if (editorStore.selectedFeatureType) {
      editorStore.setSelectedEditType(null);
      editorStore.toggleDrawing();
    }
  };

  const handleDrawFinish = (feature: Partial<ICreatedMapFeature>) => editorStore.setFeature(feature);
  const handleDrawCancel = () => editorStore.toggleDrawing();

  const handleCloseTab = () => {
    editorStore.setFeature(null);
    handleDrawCancel();
  };

  return (
    <Box>
      <Paper className='editorBox' elevation={5}>
        <EditorPanel onSelect={handleEditTypeSelect} />
        <TypesDialog onChange={handleFeatureTypeSelect} onApply={onFeatureTypeApply} onCancel={() => handleEditTypeSelect(null)} />
        <TabCreate onSubmit={handleCloseTab} onClose={handleCloseTab} />
      </Paper>
      <Paper className='editorCtrlBox' elevation={5}>
        <LayerDraw onFinish={handleDrawFinish} onCancel={handleDrawCancel} />
      </Paper>
      <Snackbar open={alert} onClose={() => setAlert(false)} autoHideDuration={2000}>
        <MuiAlert elevation={5} onClose={() => setAlert(false)} severity='info' sx={{ width: '100%' }} variant='filled'>
          Необходимо авторизоваться!
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

interface EditorPanelProps {
  onSelect: (type: GeometryType) => void;
}
const EditorPanel: React.FC<EditorPanelProps> = observer(({ onSelect }) => {
  Logger.info('EditorPanel');

  return (
    <>
      <IconButton className='editorBtn' size='large' onClick={() => onSelect(GeometryType.POLYGON)} disabled={editorStore.isDrawing}>
        <HomeWorkOutlinedIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={() => onSelect(GeometryType.MULTI_LINE_STRING)} disabled={editorStore.isDrawing}>
        <LinearScaleOutlinedIcon />
      </IconButton>
      <IconButton className='editorBtn' size='large' onClick={() => onSelect(GeometryType.MULTI_POLYGON)} disabled={editorStore.isDrawing}>
        <HighlightAltOutlinedIcon />
      </IconButton>
    </>
  );
});

interface TypesDialogProps {
  onChange: (type: IMapFeatureType | null) => void;
  onApply: () => void;
  onCancel: () => void;
}
const TypesDialog: React.FC<TypesDialogProps> = observer(({ onChange, onCancel, onApply }) => {
  Logger.info('TypesDialog');

  return (
    <Dialog open={Boolean(editorStore.selectedEditType)} onClose={onCancel}>
      <DialogTitle>Выбрать тип</DialogTitle>
      <DialogContent>
        <FeatureTypesAutocomplete sx={{ mt: 3, width: 300 }} onChange={onChange} selectedGeometry={editorStore.selectedEditType} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Отменить</Button>
        <Button onClick={onApply}>Выбрать</Button>
      </DialogActions>
    </Dialog>
  );
});
