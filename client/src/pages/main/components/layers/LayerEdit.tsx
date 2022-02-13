import CheckIcon from '@mui/icons-material/Check';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { Box, IconButton } from '@mui/material';
import { observe } from 'mobx';
import { observer } from 'mobx-react-lite';
import { Polygon } from 'ol/geom';
import { Draw } from 'ol/interaction';
import { DrawEvent } from 'ol/interaction/Draw';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { FC, useContext } from 'react';
import { GeometryType } from '../../../../constants/geometry.type';
import { MapContext } from '../../../../MapProvider';
import { editorStore } from '../../../../store/editor.store';
import { toTuple } from '../../../../utils/CoordinatesUtil';
import '../../styles/Widget.scss';

interface LayerEditProps {
    onFinish: () => void;
}

export const LayerEdit: FC<LayerEditProps> = observer(({ onFinish }) => {
    console.log('LayerEdit');

    const { map } = useContext(MapContext);
    const lastCoordinates: Array<Array<number>> = []; // координаты точек полигонов объекта геометрии
    let draw: Draw | null = null;

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

    if (editorStore.isDrawing) {
        console.log('addLayer');

        map?.addLayer(baseLayer);

        /* Инициализация создания нового объекта */
        draw = new Draw({ source, type: editorStore.selectedFeatureType?.geometry ?? '' });
        draw.on('drawstart', (event: DrawEvent) => {
            editorStore.newFeature = event.feature; // запоминание текущего создаваемого объекта геометрии
        });

        draw.on('drawend', () => {
            /* if (!isTabCreateOpen.value) {
                completeDrawing();
            } */
            completeDrawing();
        });
    }

    /**
     * Завершение создания полигонов
     */
    function completeDrawing() {
        const coordinates = (editorStore.newFeature?.getGeometry() as Polygon).getCoordinates();
        editorStore.newFeatureCoordinates = toTuple(coordinates);
        editorStore.newFeatureZoom = map?.getView()?.getZoom() ?? -1;

        //isTabCreateOpen.value = true;
        if (draw) {
            console.log('finish');

            draw?.finishDrawing();
            map?.removeInteraction(draw);
        }
        onFinish();
    }

    /**
     * Отмена действия при создании объекта
     */
    function undo() {
        const geometryCoordinates = (editorStore.newFeature?.getGeometry() as Polygon)?.getCoordinates()[0];

        if (geometryCoordinates && geometryCoordinates.length > 1) {
            lastCoordinates.push(geometryCoordinates[geometryCoordinates.length - 2]);
            draw?.removeLastPoint();
        }
    }

    /**
     * Отмена отмены действия при создании объекта
     */
    function redo() {
        const coordinates = lastCoordinates.pop();

        if (coordinates) {
            draw?.appendCoordinates(Array(coordinates));
        }
    }

    /**
     * Переустановка данных в изначальную позицию
     */
    function resetDrawing() {
        console.log('reset');

        draw?.abortDrawing();

        // if (editorStore.newFeature) {
        //     baseLayer?.getSource().removeFeature(editorStore.newFeature);
        // }

        if (draw) {
            map?.removeInteraction(draw);
        }
    }

    if (editorStore.selectedFeatureType) {
        if (draw) map?.addInteraction(draw);

        window.addEventListener('keyup', function (event) {
            if (event.key === 'Escape') {
                if (editorStore.isDrawing) {
                    editorStore.toggleEdit();
                }
            }
        });

        observe(editorStore, 'isDrawing', () => {
            resetDrawing();
        });
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
