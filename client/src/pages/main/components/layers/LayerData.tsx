import { observe } from 'mobx';
import { Feature } from 'ol';
import { pointerMove } from 'ol/events/condition';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { transformExtent } from 'ol/proj';
import { Vector } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import React from 'react';
import { MapContext } from '../../../../MapProvider';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { IMapFeatureType } from '../../../../types/IMapFeatureType';
import { toArray } from '../../../../utils/CoordinatesUtil';
import { createLabelStyle, createStyles } from './styles/OlStyles';

export const LayerData = () => {
    console.log('LayerData');

    const { map } = React.useContext(MapContext);

    // const url = ref('https://ahocevar.com/geoserver/wfs?service=wfs&request=getfeature&typename=topp:states&cql_filter=STATE_NAME=\'Idaho\'&outputformat=application/json');
    /* Data object init */
    // https://stackoverflow.com/questions/27093482/is-it-possible-to-add-a-icon-symbol-to-a-polygon/27251137#27251137

    const vectorSource = new Vector({
        format: new GeoJSON()
    });

    /**
     * Базовый слой с объектами
     */
    const baseLayer = new VectorLayer({
        source: vectorSource,
        style: function (feature) {
            const styles = createStyles((feature.getProperties().type as IMapFeatureType).styles);
            const labelStyle = createLabelStyle(feature.get('name'), feature.get('icon'), styles.length + 1, feature.getGeometry());
            return [...styles, labelStyle];
        },
        renderBuffer: 5000
    });

    map?.on('moveend', async function (e) {
        const zoom = map.getView().getZoom();
        const extent = transformExtent(map.getView().calculateExtent(map.getSize()), 'EPSG:3857', 'EPSG:4326');

        if (extent && zoom) {
            const featureCollection = await MapService.getMapData(extent, zoom);

            vectorSource.forEachFeature((feature: Feature<Geometry>) => {
                let isFound = false;
                for (const newFeature of featureCollection.features) {
                    if (feature.getProperties().id == newFeature.properties.id) {
                        isFound = true;
                        featureCollection.features.splice(featureCollection.features.indexOf(newFeature), 1);
                        return;
                    }
                }

                if (!isFound) {
                    vectorSource.removeFeature(feature);
                }
            });

            featureCollection.features.map((feature: any) => {
                feature.geometry.coordinates = toArray(feature.geometry.coordinates, feature.geometry.type);
                return feature;
            });

            const convertedFeatures = vectorSource?.getFormat()?.readFeatures(featureCollection, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });

            if (convertedFeatures) {
                vectorSource.addFeatures(convertedFeatures as Feature<Geometry>[]);
            }
        }
    });

    map?.addLayer(baseLayer);

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

    /* Hover init */
    /**
     * Стиль наведенного объекта
     */
    const hoveredStyle = new Style({
        zIndex: 0,
        fill: new Fill({
            color: 'rgba(229,229,229,0.35)'
        }),
        stroke: new Stroke({
            color: '#26bae8',
            width: 5
        })
    });

    function hoverStyle(feature: Feature<Geometry>) {
        const labelStyle = createLabelStyle(feature.get('name'), feature.get('icon'), 1, feature.getGeometry());
        return [hoveredStyle, labelStyle];
    }

    /**
     * Событие наведение на объект
     */
    const hoverEvent = new Select({ condition: pointerMove, style: hoverStyle as any, filter: featureFilter as any }); // any fixes bug
    map?.addInteraction(hoverEvent);

    /**
     * Отслеживание включенного режима редактирования
     */
    observe(editorStore, 'isDrawing', change => {
        if (change.newValue) {
            map?.removeInteraction(hoverEvent);
        } else {
            map?.addInteraction(hoverEvent);
        }
    });

    return <></>;
};
