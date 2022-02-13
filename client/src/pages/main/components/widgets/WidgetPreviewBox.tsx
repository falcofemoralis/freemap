import { Paper, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { OverviewMap } from 'ol/control';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import * as React from 'react';
import { useContext } from 'react';
import MapConstant from '../../../../constants/map.constant';
import { MapContext } from '../../../../MapProvider';
import { mapStore } from '../../../../store/map.store';
import '../../styles/Widget.scss';

const PreviewMapLabel = observer(() => {
    return (
        <>
            {mapStore.mapType === MapConstant.GOOGLE ? (
                <Typography variant='subtitle2'>Земля</Typography>
            ) : (
                <Typography variant='subtitle2'>Карта</Typography>
            )}
        </>
    );
});

export const WidgetPreviewBox = () => {
    const { map } = useContext(MapContext);

    /* Map preview init */
    const baseLayer = new TileLayer();
    const mapPreview = new OverviewMap({
        className: 'previewMap',
        collapsed: false,
        collapsible: false,
        rotateWithView: false
    });
    if (map) {
        mapPreview.getOverviewMap().addLayer(baseLayer);
        mapPreview.setMap(map); // attach main map
        setPreviewMapLayer(mapStore.mapType as string);
    }

    /**
     * Установка нового слоя превью карты
     * @param {MapConstant} type - тип карты (Земля\OSM)
     */
    function setPreviewMapLayer(type: MapConstant) {
        baseLayer.setSource(
            new XYZ({
                url: type as string
            })
        );
    }

    /**
     * Изменение типа текущей карты (Земля\OSM\etc)
     */
    async function changeMapType() {
        setPreviewMapLayer((await mapStore.toggleMapType()) as string);
    }

    return (
        <Paper className='previewMapBox' elevation={5} onClick={changeMapType}>
            <div className='previewMapBox__label'>
                <PreviewMapLabel />
            </div>
        </Paper>
    );
};
