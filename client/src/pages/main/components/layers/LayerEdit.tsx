import CheckIcon from '@mui/icons-material/Check';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Geometry, LineString, MultiLineString, MultiPolygon, Polygon } from 'ol/geom';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import React from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { editorStore } from '../../../../store/editor.store';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import { toTuple } from '../../../../utils/CoordinatesUtil';
import '../../styles/Widget.scss';
import { createLabelStyle, createStyles } from './styles/OlStyles';

interface LayerEditProps {
    onFinish: () => void;
}

export const LayerEdit: React.FC<LayerEditProps> = ({ onFinish }) => {
    console.log('LayerEdit');

    const { map } = React.useContext(MapContext);

    /* Edit Layer Init */
    const source = new VectorSource();
    const baseLayer = new VectorLayer({
        source,
        style: function (feature) {
            if (feature.getProperties().type) {
                const styles = createStyles((feature.getProperties().type as IMapFeatureType).styles);
                const labelStyle = createLabelStyle(feature.get('name'), feature.get('icon'), styles.length + 1, feature.getGeometry());
                return [...styles, labelStyle];
            } else {
                return [];
            }
        },
        renderBuffer: 5000
    });
    map?.addLayer(baseLayer);

    return <Editor onFinish={onFinish} source={source} baseLayer={baseLayer} />;
};

interface EditorProps {
    onFinish: () => void;
    source: VectorSource<Geometry>;
    baseLayer: VectorLayer<VectorSource<Geometry>>;
}
const Editor: React.FC<EditorProps> = observer(({ source, baseLayer, onFinish }) => {
    console.log('Editor');

    const { map } = React.useContext(MapContext);
    const lastCoordinates: Array<Array<number>> = []; // координаты точек полигонов объекта геометрии
    const [draw, setDraw] = React.useState<Draw | null>(null);

    /**
     * Завершение создания полигонов
     */
    const completeDrawing = () => {
        editorStore.newFeatureZoom = map?.getView()?.getZoom() ?? -1;

        switch (editorStore.selectedFeatureType?.geometry) {
            case GeometryType.POLYGON:
                editorStore.newFeatureCoordinates = toTuple(
                    (editorStore.newFeature?.getGeometry() as Polygon).getCoordinates(),
                    GeometryType.POLYGON
                );
                break;
            case GeometryType.LINE_STRING:
                editorStore.newFeatureCoordinates = toTuple(
                    (editorStore.newFeature?.getGeometry() as LineString).getCoordinates(),
                    GeometryType.LINE_STRING
                );
                break;
            case GeometryType.MULTI_POLYGON:
                // TODO FIX TO MULTI_POLYGON !!!!!!!!!!!!!!!!!!!!!!!!!!!
                editorStore.newFeatureCoordinates = toTuple(
                    (editorStore.newFeature?.getGeometry() as MultiLineString).getCoordinates(),
                    GeometryType.MULTI_POLYGON
                );
                break;
        }

        //isTabCreateOpen.value = true;
        if (draw) {
            console.log('finish');

            draw?.finishDrawing();
            map?.removeInteraction(draw);
        }
        onFinish();
    };

    /**
     * Переустановка данных в изначальную позицию
     */
    const resetDrawing = () => {
        console.log('resetDrawing()');

        draw?.abortDrawing();

        if (editorStore.newFeature) {
            console.log('removed');
            console.log(editorStore.newFeature);

            baseLayer?.getSource().removeFeature(editorStore.newFeature);
        }

        if (draw) {
            console.log('removed draw');
            map?.removeInteraction(draw);
            setDraw(null);
        }
    };

    /**
     * Отмена действия при создании объекта
     */
    const undo = () => {
        const geometryCoordinates = (editorStore.newFeature?.getGeometry() as Polygon)?.getCoordinates()[0];

        if (geometryCoordinates && geometryCoordinates.length > 1) {
            lastCoordinates.push(geometryCoordinates[geometryCoordinates.length - 2]);
            draw?.removeLastPoint();
        }
    };

    /**
     * Отмена отмены действия при создании объекта
     */
    const redo = () => {
        const coordinates = lastCoordinates.pop();

        if (coordinates) {
            draw?.appendCoordinates(Array(coordinates));
        }
    };

    if (editorStore.selectedFeatureType) {
        if (editorStore.isDrawing) {
            if (!draw) {
                console.log('draw init');
                setDraw(
                    new Draw({
                        source,
                        type: editorStore.selectedFeatureType?.geometry,
                        style: createStyles(editorStore.selectedFeatureType.styles)
                    })
                );
            } else if (draw) {
                console.log('add draw');

                draw?.on('drawstart', (event: DrawEvent) => {
                    editorStore.newFeature = event.feature; // запоминание текущего создаваемого объекта геометрии
                });

                draw?.on('drawend', () => {
                    completeDrawing();
                });
                if (draw) {
                    map?.addInteraction(draw);

                    window.addEventListener('keyup', function (event) {
                        if (event.key === 'Escape') {
                            if (editorStore.isDrawing) {
                                editorStore.toggleEdit();
                            }
                        }
                    });
                }
            }
        } else {
            resetDrawing();
        }
    }

    return (
        <>
            {editorStore.isDrawing && (
                <Box>
                    <IconButton className='editorBtn' size='large' onClick={undo}>
                        <UndoIcon />
                    </IconButton>
                    <IconButton className='editorBtn' size='large' onClick={redo}>
                        <RedoIcon />
                    </IconButton>
                    {editorStore.selectedFeatureType?.geometry == GeometryType.LINE_STRING && (
                        <IconButton className='editorBtn' size='large' onClick={completeDrawing}>
                            <CheckIcon />
                        </IconButton>
                    )}
                </Box>
            )}
        </>
    );
});
