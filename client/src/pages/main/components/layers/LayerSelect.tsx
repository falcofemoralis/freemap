import { observe } from 'mobx';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import { Fill, Stroke, Style, Text } from 'ol/style';
import { useContext } from 'react';
import { MapContext } from '../../../../MapProvider';
import { editorStore } from '../../../../store/editor.store';
import { mapStore } from '../../../../store/map.store';
import { TabSelect } from '../tabs/TabSelect';
import { observer } from 'mobx-react-lite';
import MapService from '../../../../services/map.service';
import { IMapFeature } from '../../../../types/IMapFeature';

export const LayerSelect = observer(() => {
    const { map } = useContext(MapContext);

    /* Select init */
    /**
     * Стиль выбраннного объекта
     */
    const selected = new Style({
        fill: new Fill({
            color: 'rgba(255,0,0,0.17)'
        }),
        stroke: new Stroke({
            color: 'rgba(255,26,26,0.7)',
            width: 2
        }),
        text: new Text({
            font: '14px Calibri,sans-serif',
            fill: new Fill({ color: '#000' }),
            stroke: new Stroke({
                color: '#fff',
                width: 2
            })
        })
    });

    function selectStyle(feature: Feature<Geometry>) {
        // const color = feature.get('COLOR') || '#eeeeee';
        // selected.getFill().setColor(color);
        selected.getText().setText(feature.get('name'));
        return [selected];
    }

    /**
     * Фильтр объектов на карте
     * @param {Feature<Geometry>} feature - объект на карты
     */
    function featureFilter(feature: Feature<Geometry>) {
        const featureExtent = feature.getGeometry()?.getExtent();
        const mapExtent = map?.getView().calculateExtent(map.getSize());

        if (featureExtent && mapExtent) {
            return featureExtent[0] - mapExtent[0] > 0 && featureExtent[1] - mapExtent[1] > 0;
        }
    }

    /**
     * Событие нажатия на объект
     */
    const selectEvent = new Select({ style: selectStyle as any, filter: featureFilter as any }); // any fixes bug
    selectEvent.on('select', (event: SelectEvent) => {
        const features: Feature<Geometry>[] = event.selected;
        if (features.length > 0) {
            mapStore.selectedFeatureId = features[0].getProperties().id;
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
        selectEvent.changed();
        mapStore.selectedFeatureId = null;
        selectEvent.getFeatures().clear();
        console.log('clear');
    };

    return <>{mapStore.selectedFeatureId && <TabSelect onClose={handleTabClose} featureId={mapStore.selectedFeatureId} />}</>;
});
