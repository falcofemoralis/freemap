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
import { observer } from 'mobx-react-lite';

export const WidgetEditorBox = observer(() => {
  const [typesDialogOpen, setTypesDialogOpen] = useState(false);
  const [tabOpen, setTabOpen] = useState(false);

  /**
   * Handle geometry type select from editor panel box
   * @param type - geometry type
   */
  const onEditTypeSelect = (type: GeometryType | null) => {
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

  const onDrawComplete = () => setTabOpen(true);
  const onDrawCancel = () => editorStore.toggleDrawing();

  /**
   * Handle tab create close
   */
  const onTabClose = () => {
    setTabOpen(false);
  };

  const onSubmit = () => {
    onDrawCancel();
    onTabClose();
    editorStore.setCreatedGeometry(null);
  };

  console.log(editorStore.isDrawing);

  return (
    <Box>
      <Paper className='editorBox' elevation={5}>
        <EditorPanel onSelect={onEditTypeSelect} />
        <TypesDialog open={typesDialogOpen} onApply={onFeatureTypeApply} onCancel={() => setTypesDialogOpen(false)} />
        <TabCreate open={tabOpen} onSubmit={onSubmit} onClose={onTabClose} />
      </Paper>
      <Paper className='editorCtrlBox' elevation={5}>
        {editorStore.isDrawing && <LayerDraw onComplete={onDrawComplete} onCancel={onDrawCancel} />}
      </Paper>
      <EditorAlert />
    </Box>
  );
});
