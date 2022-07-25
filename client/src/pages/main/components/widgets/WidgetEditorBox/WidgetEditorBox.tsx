import { GeometryType } from '@/constants/geometry.type';
import { authStore } from '@/store/auth.store';
import { editorStore } from '@/store/editor.store';
import { ICreatedMapFeature } from '@/types/IMapFeature';
import { IMapFeatureType } from '@/types/IMapFeatureType';
import { Box, Paper } from '@mui/material';
import { LayerDraw } from '../../layers/LayerDraw/LayerDraw';
import { TabCreate } from '../../tabs/TabCreate/TabCreate';
import { EditorAlert } from './components/EditorAlert/EditorAlert';
import { EditorPanel } from './components/EditorPanel/EditorPanel';
import { TypesDialog } from './components/TypesDialog/TypesDialog';
import './WidgetEditorBox.scss';

export const WidgetEditorBox = () => {
  /**
   * Handle geometry type select from editor panel box
   * @param type - geometry type
   */
  const handleEditTypeSelect = (type: GeometryType | null) => {
    if (!authStore.isAuth) {
      editorStore.toggleAlert();
      return;
    }

    editorStore.setSelectedEditType(type);
  };

  /**
   * Handle feature type select from types dialog
   * @param type - selected type
   */
  const handleFeatureTypeSelect = (type: IMapFeatureType | null) => {
    editorStore.setSelectedFeatureType(type);
  };

  /**
   * Handle feature type apply
   */
  const onFeatureTypeApply = () => {
    // check if featureType was select in onChange
    if (editorStore.selectedFeatureType) {
      editorStore.setSelectedEditType(null);
      editorStore.toggleDrawing();
    }
  };

  const handleDrawFinish = (feature: Partial<ICreatedMapFeature>) => editorStore.setFeature(feature);
  const handleDrawCancel = () => editorStore.toggleDrawing();

  /**
   * Handle tab create close
   */
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
      <EditorAlert />
    </Box>
  );
};
