import { authStore } from '@/store/auth.store';
import { editorStore } from '@/store/editor.store';
import { GeometryType } from '@/types/IMapData';
import { IFeatureType } from '@/types/IFeatureType';
import { Box, Paper } from '@mui/material';
import { useState } from 'react';
import { LayerDraw } from '../../layers/LayerDraw/LayerDraw';
import { TabCreate } from '../../tabs/TabCreate/TabCreate';
import { EditorAlert } from './components/EditorAlert/EditorAlert';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { TypesDialog } from './components/TypesDialog/TypesDialog';
import './WidgetEditorBox.scss';

export const WidgetEditorBox = () => {
  const [typesDialogOpen, setTypesDialogOpen] = useState(false);
  /**
   * Handle geometry type select from editor panel box
   * @param type - geometry type
   */
  const handleEditTypeSelect = (type: GeometryType | null) => {
    if (!authStore.isAuth) {
      editorStore.toggleAlert();
      return;
    }

    setTypesDialogOpen(true);
    editorStore.setDrawMode(type);
  };

  /**
   * Handle feature type apply
   */
  const onFeatureTypeApply = (type: IFeatureType | null) => {
    if (type) {
      setTypesDialogOpen(false);
      editorStore.toggleDrawing();
      editorStore.setSelectedFeatureType(type);
    }
  };

  const handleDrawCancel = () => editorStore.toggleDrawing();

  /**
   * Handle tab create close
   */
  const handleCloseTab = () => {
    editorStore.setCreatedGeometry(null);
    handleDrawCancel();
  };

  return (
    <Box>
      <Paper className='editorBox' elevation={5}>
        <EditorPanel onSelect={handleEditTypeSelect} />
        <TypesDialog open={typesDialogOpen} onApply={onFeatureTypeApply} onCancel={() => setTypesDialogOpen(false)} />
        <TabCreate onSubmit={handleCloseTab} onClose={handleCloseTab} />
      </Paper>
      <Paper className='editorCtrlBox' elevation={5}>
        <LayerDraw onCancel={handleDrawCancel} />
      </Paper>
      <EditorAlert />
    </Box>
  );
};
