import { useContext } from 'react';
import { MapContext } from '../../../../MapProvider';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Vector } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature, Map } from 'ol';
import { GeoJSON } from 'ol/format';
import { Select } from 'ol/interaction';
import { Geometry } from 'ol/geom';
import { pointerMove } from 'ol/events/condition';
import { SelectEvent } from 'ol/interaction/Select';
import { transformExtent } from 'ol/proj';
import { observable, observe } from 'mobx';
import { editorStore } from '../../../../store/editor.store';
import MapService from '../../../../services/map.service';

export const LayerData = () => {
    const { map } = useContext(MapContext);

    /**
     * Стиль объектов на карте
     */
    const style = new Style({
        fill: new Fill({
            color: 'rgba(255,255,255,0)'
        }),
        stroke: new Stroke({
            color: '#969696',
            width: 2
        }),
        image: new Circle({
            radius: 7,
            fill: new Fill({
                color: '#ffcc33'
            })
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
            style.getText().setText(feature.get('name'));
            return [style];
        },
        renderBuffer: 5000
    });

    map?.on('moveend', async function (e) {
        const zoom = map.getView().getZoom();
        const extent = transformExtent(map.getView().calculateExtent(map.getSize()), 'EPSG:3857', 'EPSG:4326');

        if (extent && zoom) {
            const res = await MapService.getMapData(extent, zoom);

            vectorSource.forEachFeature((feature: Feature<Geometry>) => {
                let isFound = false;
                for (const newFeature of res.features) {
                    if (feature.getProperties().id == newFeature.properties.id) {
                        isFound = true;
                        res.features.splice(res.features.indexOf(newFeature), 1);
                        return;
                    }
                }

                if (!isFound) {
                    vectorSource.removeFeature(feature);
                }
            });

            const convertedFeatures = vectorSource?.getFormat()?.readFeatures(res, {
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
    const hovered = new Style({
        fill: new Fill({
            color: 'rgba(229,229,229,0.35)'
        }),
        stroke: new Stroke({
            color: '#26bae8',
            width: 5
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

    function hoverStyle(feature: Feature<Geometry>) {
        // const color = feature.get('COLOR') || '#eeeeee';
        // hovered.getFill().setColor(color);
        hovered.getText().setText(feature.get('name'));
        return [hovered];
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
