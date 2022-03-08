import { observe } from 'mobx';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import { Fill, Stroke, Style, Text } from 'ol/style';
import React from 'react';
import { MapContext } from '../../../../MapProvider';
import { editorStore } from '../../../../store/editor.store';
import { mapStore } from '../../../../store/map.store';
import { TabSelect } from '../tabs/TabSelect';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import { createLabelStyle, createStyles } from './styles/OlStyles';

export const LayerSelect = () => {
    console.log('LayerSelect');

    const { map } = React.useContext(MapContext);

    /* Select init */
    /**
     * Стиль выбранного объекта
     */
    const selected = new Style({
        zIndex: 0,
        fill: new Fill({
            color: 'rgba(255,0,0,0.17)'
        }),
        stroke: new Stroke({
            color: 'rgba(255,26,26,0.7)',
            width: 2
        })
    });

    /**
     * Фильтр объектов на карте
     * @param {Feature<Geometry>} feature - объект на карты
     */
    function featureFilter(feature: Feature<Geometry>) {
        if (!feature.getProperties().select) {
            return false;
        }

        const featureExtent = feature.getGeometry()?.getExtent();
        const mapExtent = map?.getView().calculateExtent(map.getSize());

        if (featureExtent && mapExtent) {
            return featureExtent[0] - mapExtent[0] > 0 && featureExtent[1] - mapExtent[1] > 0;
        }
    }

    /**
     * Событие нажатия на объект
     */
    const selectEvent = new Select({
        filter: featureFilter as any,
        style: function (feature) {
            const labelStyle = createLabelStyle(feature.get('name'), feature.get('icon'), 1, feature.getGeometry());
            return [selected, labelStyle];
        }
    });
    selectEvent.on('select', (event: SelectEvent) => {
        const features: Feature<Geometry>[] = event.selected;
        if (features.length > 0) {
            mapStore.setSelectedFeatureId(features[0].getProperties().id);
        }
    });

    map?.addInteraction(selectEvent);

    /**
     * Отслеживание включенного режима редактирования
     */
    observe(editorStore, 'isDrawing', change => {
        if (change.newValue) {
            map?.removeInteraction(selectEvent);
        } else {
            map?.addInteraction(selectEvent);
        }
    });

    const handleTabClose = () => {
        mapStore.setSelectedFeatureId(null);
        selectEvent.changed();
        selectEvent.getFeatures().clear();
    };

    return <TabSelect onClose={handleTabClose} />;
};
