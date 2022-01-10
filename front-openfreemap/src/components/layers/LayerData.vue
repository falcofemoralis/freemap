<template>
  <div>
    <TabSelect v-if="isSelectTabOpen" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref, watch } from 'vue';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature, Map } from 'ol';
import { GeoJSON } from 'ol/format';
import { Select } from 'ol/interaction';
import { Geometry } from 'ol/geom';
import { altKeyOnly, click, pointerMove } from 'ol/events/condition';
import { useStore } from 'vuex';
import { SelectEvent } from 'ol/interaction/Select';
import TabSelect from '@/components/tabs/TabSelect.vue';
import { axiosInstance } from '@/api';

export default defineComponent({
  name: 'LayerData',
  components: {
    TabSelect
  },
  setup() {
    const store = useStore();
    const map = inject<Map>('map');
    const isSelectTabOpen = ref(false);

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
          color: '#fff', width: 2
        })
      })
    });

    // const url = ref('https://ahocevar.com/geoserver/wfs?service=wfs&request=getfeature&typename=topp:states&cql_filter=STATE_NAME=\'Idaho\'&outputformat=application/json');
    /* Data object init */
    const baseLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: axiosInstance.defaults.baseURL + '/map'
      }),
      style: function(feature) {
        style.getText().setText(feature.get('name'));
        return [style];
      },
      renderBuffer: 5000
    });
    map?.addLayer(baseLayer);

    function featureFilter(feature: Feature<Geometry>) {
      const featureExtent = feature.getGeometry()?.getExtent();
      const mapExtent = map?.getView().calculateExtent(map.getSize());

      console.log(featureExtent);
      if (featureExtent && mapExtent) {
        return (
          featureExtent[0] - mapExtent[0] > 0 &&
          featureExtent[1] - mapExtent[1] > 0
        );
      }
    }


    /* Select init */
    const selected = new Style({
      fill: new Fill({
        color: '#eeeeee'
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2
      })
    });

    function selectStyle(feature: Feature<Geometry>) {
      const color = feature.get('COLOR') || '#eeeeee';
      selected.getFill().setColor(color);
      return selected;
    }

    const selectEvent = new Select({ style: selectStyle as any, filter: featureFilter as any }); // any fixes bug
    selectEvent.on('select', (event: SelectEvent) => {
      isSelectTabOpen.value = true;
    });
    map?.addInteraction(selectEvent);

    /* Hover init */
    const hovered = new Style({
      fill: new Fill({
        color: '#eeeeee'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
        width: 5
      })
    });

    function hoverStyle(feature: Feature<Geometry>) {
      const color = feature.get('COLOR') || '#eeeeee';
      hovered.getFill().setColor(color);
      return hovered;
    }

    const hoverEvent = new Select({ condition: pointerMove, style: hoverStyle as any, filter: featureFilter as any }); // any fixes bug
    map?.addInteraction(hoverEvent);

    const isDrawingEnabled = computed(() => store.getters.getIsDrawing);
    watch(isDrawingEnabled, (current) => {
      console.log(current);
      if (current) {
        map?.removeInteraction(selectEvent);
        map?.removeInteraction(hoverEvent);
      } else {
        map?.addInteraction(selectEvent);
        map?.addInteraction(hoverEvent);
      }
    });

    return {
      isSelectTabOpen
    };
  }
});
</script>

<style lang="scss" scoped>

</style>