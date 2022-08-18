import { MapContext } from '@/MapContext';
import { editorStore } from '@/store/editor.store';
import { mapStore } from '@/store/map.store';
import { FeatureProps } from '@/types/IMapData';
import mapboxgl, { GeoJSONSource } from 'mapbox-gl';
import { useContext, useEffect } from 'react';

export const LayerData = () => {
  const { mainMap } = useContext(MapContext);

  if (!mainMap) {
    return null;
  }

  /**
   * Init map data
   */
  useEffect(() => {
    const init = async () => {
      const mapData = await loadData();
      if (!mapData) return;
      for (const source of mapData.sources) {
        mainMap.addSource(source.id, {
          type: 'geojson',
          data: source.featureCollection,
          promoteId: 'id'
        });
      }

      for (const layer of mapData.layers) {
        if (mapData.sources.find(s => s.id == layer.source)) {
          mainMap.addLayer(layer as mapboxgl.AnyLayer);
        }

        if (layer.id.includes('label')) {
          continue;
        }

        mainMap.on('click', layer.id, e => {
          if (editorStore.isDrawing) return;
          if (e && e.features && e.features.length > 0) {
            console.log(e.features);

            mapStore.setSelectedFeatureId((e.features[0].properties as FeatureProps).id);
          }
        });
      }
    };

    init();
  }, []);

  /**
   * Load map features collections
   */
  const loadData = async () => {
    const bounds = mainMap.getBounds();
    const coords = [bounds.getWest(), bounds.getNorth()];

    mainMap.once('sourcedata', () => {
      console.log('updated');

      mapStore.performingUpdate = false;
    });

    return await mapStore.updateMapData(
      bounds.toArray(),
      Number.parseInt(mainMap.getZoom().toFixed(0)),
      coords,
      mainMap.getCanvas().height,
      mainMap.getCanvas().width
    );
  };

  /**
   * load and update current features collections
   */
  const update = async () => {
    const mapData = await loadData();
    if (!mapData) return;
    for (const source of mapData.sources) {
      (mainMap.getSource(source.id) as GeoJSONSource)?.setData(source.featureCollection);
    }
  };

  mainMap.on('dragend', () => update());
  mainMap.on('zoomend', () => update());

  return null;
};
