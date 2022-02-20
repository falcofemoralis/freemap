import CheckIcon from '@mui/icons-material/Check';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { Geometry, LineString, MultiLineString, Polygon } from 'ol/geom';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import React from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { editorStore } from '../../../../store/editor.store';
import { toTuple } from '../../../../utils/CoordinatesUtil';
import '../../styles/Widget.scss';

interface LayerEditProps {
    onFinish: () => void;
}

export const LayerEdit: React.FC<LayerEditProps> = ({ onFinish }) => {
    console.log('LayerEdit');

    const { map } = React.useContext(MapContext);
    const style = new Style({
        fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new Circle({
            radius: 7,
            fill: new Fill({
                color: '#ffcc33'
            })
        }),
        text: new Text({
            font: '12px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({
                color: '#fff',
                width: 2
            })
        })
    });

    /* Edit Layer Init */
    const source = new VectorSource();
    const baseLayer = new VectorLayer({
        source,
        style: function (feature) {
            style.getText().setText(feature.get('name'));
            return [style];
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
        // IF ELSE FOR TEST !!!
        if (editorStore.selectedFeatureType?.geometry == GeometryType.POLYGON) {
            console.log('POLYGON');
            const coordinates = (editorStore.newFeature?.getGeometry() as Polygon).getCoordinates();
            editorStore.newFeatureCoordinates = toTuple(coordinates, GeometryType.POLYGON);
        } else if (editorStore.selectedFeatureType?.geometry == GeometryType.LINE_STRING) {
            console.log('LINE_STRING');
            const coordinates = (editorStore.newFeature?.getGeometry() as LineString).getCoordinates();
            editorStore.newFeatureCoordinates = toTuple(coordinates, GeometryType.LINE_STRING);
        } else if (editorStore.selectedFeatureType?.geometry == GeometryType.MULTI_POLYGON) {
            console.log('MULTI_POLYGON');
            const coordinates = (editorStore.newFeature?.getGeometry() as MultiLineString).getCoordinates();
            editorStore.newFeatureCoordinates = toTuple(coordinates, GeometryType.MULTI_POLYGON);
        } else {
            return;
        }

        editorStore.newFeatureZoom = map?.getView()?.getZoom() ?? -1;

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
                console.log(editorStore.selectedFeatureType?.geometry);

                setDraw(new Draw({ source, type: editorStore.selectedFeatureType?.geometry }));
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