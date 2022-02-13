import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Draw } from 'ol/interaction';
import Map from 'ol/Map';
import { Feature } from 'ol';
import { DrawEvent } from 'ol/interaction/Draw';
import { Geometry, Polygon } from 'ol/geom';
import { FC, useContext } from 'react';
import { MapContext } from '../../../../MapProvider';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import CheckIcon from '@mui/icons-material/Check';
import '../../styles/Widget.scss';
import { IconButton } from '@mui/material';
import { mapStore } from '../../../../store/map.store';
import { observe } from 'mobx';
import { editorStore } from '../../../../store/editor.store';
import { GeometryType } from '../../../../constants/geometry.type';
import { toTuple } from '../../../../utils/CoordinatesUtil';
import { Coordinate } from '../../../../types/IMapFeature';

interface LayerEditProps {
    featureType: IMapFeatureType | null;
    onFinish: (coordinates: Coordinate[], zoom: number) => void;
}

export const LayerEdit: FC<LayerEditProps> = ({ featureType, onFinish }) => {
    const { map } = useContext(MapContext);
    const lastCoordinates: Array<Array<number>> = []; // координаты точек полигонов объекта геометрии

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

    /* Инициализация создания нового объекта */
    const draw = new Draw({ source, type: featureType?.geometry ?? '' });
    draw.on('drawstart', (event: DrawEvent) => {
        editorStore.newFeature = event.feature; // запоминание текущего создаваемого объекта геометрии
    });

    draw.on('drawend', () => {
        /* if (!isTabCreateOpen.value) {
            completeDrawing();
        } */
        completeDrawing();
    });

    map?.addInteraction(draw);

    window.addEventListener('keyup', function (event) {
        if (event.key === 'Escape') {
            if (editorStore.isDrawing) {
                editorStore.toggleEdit();
            }
        }
    });

    /**
     * Завершение создания полигонов
     */
    function completeDrawing() {
        const coordinates = (editorStore.newFeature?.getGeometry() as Polygon).getCoordinates();
        const zoom = map?.getView()?.getZoom() ?? -1;
        onFinish(toTuple(coordinates), zoom);
        //isTabCreateOpen.value = true;
        draw.finishDrawing();
        map?.removeInteraction(draw);
    }

    /**
     * Отмена действия при создании объекта
     */
    function undo() {
        const geometryCoordinates = (editorStore.newFeature?.getGeometry() as Polygon)?.getCoordinates()[0];

        if (geometryCoordinates && geometryCoordinates.length > 1) {
            lastCoordinates.push(geometryCoordinates[geometryCoordinates.length - 2]);
            draw.removeLastPoint();
        }
    }

    /**
     * Отмена отмены действия при создании объекта
     */
    function redo() {
        const coordinates = lastCoordinates.pop();

        if (coordinates) {
            draw.appendCoordinates(Array(coordinates));
        }
    }

    /**
     * Переустановка данных в изначальную позицию
     */
    function resetDrawing() {
        console.log('reset');

        draw.abortDrawing();

        if (editorStore.newFeature) {
            baseLayer?.getSource().removeFeature(editorStore.newFeature);
        }

        map?.removeInteraction(draw);
    }

    observe(editorStore, 'isDrawing', change => {
        resetDrawing();
    });

    return (
        <>
            <IconButton className='editorBtn' size='large' onClick={undo}>
                <UndoIcon />
            </IconButton>
            <IconButton className='editorBtn' size='large' onClick={redo}>
                <RedoIcon />
            </IconButton>
            {featureType?.geometry == GeometryType.LINE_STRING && (
                <IconButton className='editorBtn' size='large' onClick={completeDrawing}>
                    <CheckIcon />
                </IconButton>
            )}
        </>
    );
};
