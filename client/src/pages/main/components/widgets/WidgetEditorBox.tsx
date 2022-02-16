import HighlightAltOutlinedIcon from '@mui/icons-material/HighlightAltOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LinearScaleOutlinedIcon from '@mui/icons-material/LinearScaleOutlined';
import { Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, TextField } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import '../../styles/Widget.scss';
import { LayerEdit } from '../layers/LayerEdit';
import { TabCreate } from '../tabs/TabCreate';

export const WidgetEditorBox = () => {
    console.log('WidgetEditorBox');

    const featureTypes: Array<IMapFeatureType> = [];
    MapService.getFeatureTypes().then(types => {
        featureTypes.push(...types);
    });

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
                <TypesDialog
                    featureTypes={featureTypes}
                    onChange={handleFeatureTypeSelect}
                    onApply={onFeatureTypeApply}
                    onCancel={() => handleEditSelect(null)}
                />
                <TabCreate onSubmit={handleCreateFeature} onClose={handleCloseTab} />
            </Paper>
            <Paper className='editorCtrlBox' elevation={5}>
                <LayerEdit onFinish={handleDrawFinish} />
            </Paper>
        </Box>
    );
};

interface TypesDialogProps {
    featureTypes: Array<IMapFeatureType>;
    onChange: (type: IMapFeatureType | null) => void;
    onApply: () => void;
    onCancel: () => void;
}
const TypesDialog: React.FC<TypesDialogProps> = observer(({ featureTypes, onChange, onCancel, onApply }) => {
    return (
        <Dialog open={Boolean(editorStore.selectedEditType)} onClose={onCancel}>
            <DialogTitle>Выбрать тип</DialogTitle>
            <DialogContent>
                <Autocomplete
                    sx={{ width: 300, mt: 2 }}
                    options={featureTypes}
                    autoHighlight
                    getOptionLabel={type => type.name}
                    onChange={(event, value) => onChange(value)}
                    renderOption={(props, type) =>
                        type.geometry == editorStore.selectedEditType && (
                            <Box component='li' sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                <img
                                    loading='lazy'
                                    width='20'
                                    src={`https://flagcdn.com/w20/aq.png`}
                                    srcSet={`https://flagcdn.com/w40/aq.png 2x`}
                                    alt=''
                                />
                                {type.name}
                            </Box>
                        )
                    }
                    renderInput={params => (
                        <TextField
                            {...params}
                            label='Choose a country'
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'new-password' // disable autocomplete and autofill
                            }}
                        />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Отменить</Button>
                <Button onClick={onApply}>Выбрать</Button>
            </DialogActions>
        </Dialog>
    );
});
