import HighlightAltOutlinedIcon from '@mui/icons-material/HighlightAltOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import LinearScaleOutlinedIcon from '@mui/icons-material/LinearScaleOutlined';
import {
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    IconButton,
    Paper,
    TextField
} from '@mui/material';
import { observer, useLocalObservable } from 'mobx-react-lite';
import * as React from 'react';
import { useState } from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { Coordinate } from '../../../../types/IMapFeature';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import '../../styles/Widget.scss';
import { LayerEdit } from '../layers/LayerEdit';
import { TabCreate } from '../tabs/TabCreate';

interface ILocalStore {
    selectedEdit: GeometryType | null;
    selectedFeatureType: IMapFeatureType | null;
    isTabOpen: boolean;
}

export const WidgetEditorBox = observer(() => {
    const featureTypes: Array<IMapFeatureType> = [];

    const localStore = useLocalObservable<ILocalStore>(() => ({
        selectedEdit: null,
        selectedFeatureType: null,
        isTabOpen: false
    }));

    MapService.getFeatureTypes().then(types => {
        featureTypes.push(...types);
    });

    const handleEditSelect = (type: GeometryType | null) => {
        localStore.selectedEdit = type;
    };

    const handleFeatureTypeSelect = (type: IMapFeatureType | null) => {
        localStore.selectedFeatureType = type;
    };

    const onFeatureTypeApply = () => {
        if (localStore.selectedFeatureType) {
            editorStore.toggleEdit();
            localStore.selectedEdit = null;
        }
    };

    const handleDrawFinish = (coordinates: Coordinate[], zoom: number) => {
        editorStore.coordinates = coordinates;
        editorStore.zoom = zoom;
        editorStore.selectedFeatureType = localStore.selectedFeatureType;
        localStore.isTabOpen = true;
    };

    const handleCloseTab = () => {
        localStore.isTabOpen = false;
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

                {localStore.isTabOpen && <TabCreate onSubmit={handleCloseTab} onClose={handleCloseTab} />}

                <Dialog open={Boolean(localStore.selectedEdit)} onClose={() => handleEditSelect(null)}>
                    <DialogTitle>Выбрать тип</DialogTitle>
                    <DialogContent>
                        <Autocomplete
                            sx={{ width: 300, mt: 2 }}
                            options={featureTypes}
                            autoHighlight
                            getOptionLabel={type => type.name}
                            onChange={(event, value) => handleFeatureTypeSelect(value)}
                            renderOption={(props, type) =>
                                type.geometry == localStore.selectedEdit && (
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
                        <Button onClick={() => handleEditSelect(null)}>Отменить</Button>
                        <Button onClick={onFeatureTypeApply}>Выбрать</Button>
                    </DialogActions>
                </Dialog>
            </Paper>
            <Paper className='editorCtrlBox' elevation={5}>
                {editorStore.isDrawing && <LayerEdit featureType={localStore.selectedFeatureType} onFinish={handleDrawFinish} />}
            </Paper>
        </Box>
    );
});
