import HighlightAltOutlinedIcon from '@mui/icons-material/HighlightAltOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LinearScaleOutlinedIcon from '@mui/icons-material/LinearScaleOutlined';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { AutocompleteType } from '../../../../components/AutocompleteType';
import { GeometryType } from '../../../../constants/geometry.type';
import { editorStore } from '../../../../store/editor.store';
import { mapStore } from '../../../../store/map.store';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import '../../styles/Widget.scss';
import { LayerEdit } from '../layers/LayerEdit';
import { TabCreate } from '../tabs/TabCreate';

export const WidgetEditorBox = () => {
    console.log('WidgetEditorBox');

    const handleEditSelect = (type: GeometryType | null) => {
        editorStore.selectedEditType = type;
    };

    const handleFeatureTypeSelect = (type: IMapFeatureType | null) => {
        editorStore.selectedFeatureType = type;
    };

    const onFeatureTypeApply = () => {
        if (editorStore.selectedFeatureType) {
            editorStore.toggleEdit();
            editorStore.selectedEditType = null;
        }
    };

    const handleDrawFinish = () => {
        editorStore.isEditorTabOpen = true;
    };

    const handleCreateFeature = () => {
        editorStore.newFeature = null;
        handleCloseTab();
    };

    const handleCloseTab = () => {
        editorStore.isEditorTabOpen = false;
        editorStore.toggleEdit();
    };

    return (
        <Box>
            <Paper className='editorBox' elevation={5}>
                <IconButton className='editorBtn' size='large' onClick={() => handleEditSelect(GeometryType.POLYGON)}>
                    <HomeWorkOutlinedIcon />
                </IconButton>
                <IconButton className='editorBtn' size='large' onClick={() => handleEditSelect(GeometryType.LINE_STRING)}>
                    <LinearScaleOutlinedIcon />
                </IconButton>
                <IconButton className='editorBtn' size='large' onClick={() => handleEditSelect(GeometryType.MULTI_POLYGON)}>
                    <HighlightAltOutlinedIcon />
                </IconButton>
                <TypesDialog onChange={handleFeatureTypeSelect} onApply={onFeatureTypeApply} onCancel={() => handleEditSelect(null)} />
                <TabCreate onSubmit={handleCreateFeature} onClose={handleCloseTab} />
            </Paper>
            <Paper className='editorCtrlBox' elevation={5}>
                <LayerEdit onFinish={handleDrawFinish} />
            </Paper>
        </Box>
    );
};

interface TypesDialogProps {
    onChange: (type: IMapFeatureType | null) => void;
    onApply: () => void;
    onCancel: () => void;
}
const TypesDialog: React.FC<TypesDialogProps> = observer(({ onChange, onCancel, onApply }) => {
    console.log('TypesDialog');

    return (
        <Dialog open={Boolean(editorStore.selectedEditType)} onClose={onCancel}>
            <DialogTitle>Выбрать тип</DialogTitle>
            <DialogContent>
                <AutocompleteType
                    sx={{ mt: 3, width: 300 }}
                    onChange={onChange}
                    featureTypes={mapStore.featureTypes}
                    selectedGeometry={editorStore.selectedEditType}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Отменить</Button>
                <Button onClick={onApply}>Выбрать</Button>
            </DialogActions>
        </Dialog>
    );
});
