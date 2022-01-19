<template>
  <div>
    <Animation>
      <Suspense v-if='isTabSelectOpen'>
        <template #default>
          <TabSelect @close='closeTab' :feature='selectedFeature' />
        </template>
        <template #fallback>
          <TabLoading />
        </template>
      </Suspense>
    </Animation>
  </div>
</template>

<script lang='ts'>
import { computed, defineComponent, inject, ref, watch } from 'vue';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { Feature, Map } from 'ol';
import { GeoJSON } from 'ol/format';
import { Select } from 'ol/interaction';
import { Geometry } from 'ol/geom';
import { pointerMove } from 'ol/events/condition';
import { useStore } from 'vuex';
import { SelectEvent } from 'ol/interaction/Select';
import TabSelect from '@/components/tabs/TabSelect.vue';
import { MapFeatureDto } from '../../../../shared/dto/map/mapdata.dto';
import { MapService } from '@/api/mapService';
import Animation from '@/components/elements/Animation.vue';
import TabLoading from '@/components/tabs/TabLoading.vue';

export default defineComponent({
  name: 'LayerData',
  components: {
    TabLoading,
    Animation,
    TabSelect,
  },
  setup() {
    const store = useStore();
    const map = inject<Map>('map');
    const isTabSelectOpen = ref(false);
    const selectedFeature = ref<MapFeatureDto>();

    /**
     * Стиль объектов на карте
     */
    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({
          color: '#fff', width: 2,
        }),
      }),
    });

    // const url = ref('https://ahocevar.com/geoserver/wfs?service=wfs&request=getfeature&typename=topp:states&cql_filter=STATE_NAME=\'Idaho\'&outputformat=application/json');
    /* Data object init */
    // https://stackoverflow.com/questions/27093482/is-it-possible-to-add-a-icon-symbol-to-a-polygon/27251137#27251137

    /**
     * Базовый слой с объектами
     */
    const baseLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        /*       loader: (extent, resolution, projection) => {

               }*/
        url: MapService.getMapData(),
      }),
      style: function(feature) {
        style.getText().setText(feature.get('name'));
        return [style];
      },
      renderBuffer: 5000,
    });
    map?.addLayer(baseLayer);

    /**
     * Фильтр объектов на карте
     * @param {Feature<Geometry>} feature - объект на карты
     */
    function featureFilter(feature: Feature<Geometry>) {
      const featureExtent = feature.getGeometry()?.getExtent();
      const mapExtent = map?.getView().calculateExtent(map.getSize());

      // console.log(featureExtent);
      if (featureExtent && mapExtent) {
        return (
          featureExtent[0] - mapExtent[0] > 0 &&
          featureExtent[1] - mapExtent[1] > 0
        );
      }
    }

    /* Select init */
    /**
     * Стиль выбраннного объекта
     */
    const selected = new Style({
      fill: new Fill({
        color: '#eeeeee',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    });

    function selectStyle(feature: Feature<Geometry>) {
      const color = feature.get('COLOR') || '#eeeeee';
      selected.getFill().setColor(color);
      return selected;
    }

    /**
     * Событие нажатия на объект
     */
    const selectEvent = new Select({ style: selectStyle as any, filter: featureFilter as any }); // any fixes bug
    selectEvent.on('select', (event: SelectEvent) => {
      isTabSelectOpen.value = true;

      const features: MapFeatureDto[] = event.selected;
      if (features.length > 0) {
        selectedFeature.value = features[0];
      }
    });
    map?.addInteraction(selectEvent);

    /* Hover init */
    /**
     * Стиль наведенного объекта
     */
    const hovered = new Style({
      fill: new Fill({
        color: '#eeeeee',
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 0.7)',
        width: 5,
      }),
    });

    function hoverStyle(feature: Feature<Geometry>) {
      const color = feature.get('COLOR') || '#eeeeee';
      hovered.getFill().setColor(color);
      return hovered;
    }

    /**
     * Событие наведение на объект
     */
    const hoverEvent = new Select({ condition: pointerMove, style: hoverStyle as any, filter: featureFilter as any }); // any fixes bug
    map?.addInteraction(hoverEvent);

    /**
     * Отслеживание включенного режима редактирования
     */
    const isDrawingEnabled = computed(() => store.getters.getIsDrawing);
    watch(isDrawingEnabled, (current) => {
      console.log('isDrawEnabled ' + current);
      if (current) {
        map?.removeInteraction(selectEvent);
        map?.removeInteraction(hoverEvent);
      } else {
        map?.addInteraction(selectEvent);
        map?.addInteraction(hoverEvent);
      }
    });

    /**
     * Закрытие вкладки
     */
    function closeTab() {
      selectEvent.changed();
      isTabSelectOpen.value = false;
      selectEvent.getFeatures().clear();
    }

    return {
      isTabSelectOpen,
      selectedFeature,

      closeTab,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/tab.scss";
</style>