import { observe } from 'mobx';
import { Feature } from 'ol';
import { pointerMove } from 'ol/events/condition';
import { GeoJSON } from 'ol/format';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { transformExtent } from 'ol/proj';
import { Vector } from 'ol/source';
import React from 'react';
import { MapContext } from '../../../../MapProvider';
import MapService from '../../../../services/map.service';
import { editorStore } from '../../../../store/editor.store';
import { toArray } from '../../../../utils/CoordinatesUtil';
import { CoordinatesFilter } from './filters/CoordinatesFilter';
import { HoverStyle } from './styles/HoverStyle';
import { OlStyles } from './styles/OlStyles';

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
    properties: {
      name: 'Data Layer'
    },
    style: new OlStyles().getFeatureStyle(),
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
        feature.properties.select = true;
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

  const hoverEvent = new Select({
    condition: pointerMove,
    style: new OlStyles().getStyleFunction([HoverStyle]),
    filter: new CoordinatesFilter(map).filter
  });
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
