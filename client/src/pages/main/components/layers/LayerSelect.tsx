import { observe } from 'mobx';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import React from 'react';
import { MapContext } from '../../../../MapProvider';
import { editorStore } from '../../../../store/editor.store';
import { mapStore } from '../../../../store/map.store';
import { TabSelect } from '../tabs/TabSelect';
import { CoordinatesFilter } from './filters/CoordinatesFilter';
import { OlStyles } from './styles/OlStyles';
import { SelectStyle } from './styles/SelectStyle';

export const LayerSelect = () => {
  console.log('LayerSelect');

  const { map } = React.useContext(MapContext);

  /* Select init */
  const selectEvent = new Select({
    style: new OlStyles().getStyleFunction([SelectStyle]),
    filter: new CoordinatesFilter(map).filter
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
