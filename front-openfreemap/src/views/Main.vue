<template>
  <div class='main'>
    <div class='map' ref='mapRef' />
    <LayerData />
    <WidgetAccountBox />
    <WidgetEditorBox />
    <WidgetPreviewBox />
    <WidgetSearchBox />
    <WidgetToolBox />
    <WidgetMenuBox />
  </div>
</template>

<script lang='ts'>
import WidgetEditorBox from '@/components/widgets/WidgetEditorBox.vue';
import WidgetPreviewBox from '@/components/widgets/WidgetPreviewBox.vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { computed, defineComponent, onMounted, provide, ref, watch } from 'vue';
import { useStore } from 'vuex';
import MapType from '@/constants/MapType';
import { LocationQueryValue, useRoute, useRouter } from 'vue-router';
import LayerData from '@/components/layers/LayerData.vue';
import WidgetSearchBox from '@/components/widgets/WidgetSearchBox.vue';
import WidgetToolBox from '@/components/widgets/WidgetToolBox.vue';
import WidgetAccountBox from '@/components/widgets/WidgetAccountBox.vue';
import WidgetMenuBox from '@/components/widgets/WidgetMenuBox.vue';

export default defineComponent({
  components: {
    WidgetMenuBox,
    WidgetAccountBox,
    WidgetToolBox,
    WidgetSearchBox,
    LayerData,
    WidgetPreviewBox,
    WidgetEditorBox,
  },
  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();
    const mapRef = ref(); // Map ref to html element
    let pathChanged = false;
    const COORDINATES_CHANGE_TIME = 0.25; // Измненение url каждые 250 мс

    /* Map initialization */
    const baseLayer = new TileLayer();
    const mapView = new View({
      center: [0, 0],
      zoom: 2,
      projection: 'EPSG:3857',
    });
    const map = new Map({
      layers: [baseLayer],
      view: mapView,
    });

    onMounted(() => {
      map.setTarget(mapRef.value); // attach to html element
      setMapLayer(store.getters.getMapType);
    });

    // отображение курсора на объектах
    map.on('pointermove', event => {
      const pixel = map.getEventPixel(event.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      map.getViewport().style.cursor = hit ? 'pointer' : '';
    });

    /**
     * Отслеживание изменений выбранного типа слоя карты
     */
    const mapType = computed(() => store.getters.getMapType);
    watch(mapType, (current) => {
      setMapLayer(current);
    });

    /**
     * Отслеживание измненение координат в url. Метод срабатывает при первичном заходе на сайт.
     * Карта будет выставленна в соотвествии с координатами и зумом из параметров url
     */
    const query = computed(() => route.query);
    const queryWatch = watch(query, (updatedquery: Record<string, string | LocationQueryValue[] | null>) => {
      if (updatedquery.pos && updatedquery.z) {
        const pos = updatedquery.pos.toString().split(',');
        mapView.setCenter([parseInt(pos[0]), parseInt(pos[1])]);
        mapView.setZoom(parseInt(updatedquery.z.toString()));
        //   usePosition.value = true;
        queryWatch();
      }
    });

    /**
     * Листенер изменения координат. Меняется текущий url с добавление координат и текущего зума
     */
    mapView.on('change:center', () => {
      const coordinates = mapView.getCenter();
      const zoom = mapView.getZoom();

      if (!pathChanged) {
        if (coordinates && zoom) {
          router.replace(`?pos=${coordinates}&z=${zoom}`);
        }

        pathChanged = true;

        setTimeout(() => {
          pathChanged = false;
        }, COORDINATES_CHANGE_TIME * 1000);
      }
    });

    /**
     * Установка нового слоя карты
     * @param {MapType} type - тип карты (Земля\OSM)
     */
    function setMapLayer(type: MapType) {
      baseLayer.setSource(new XYZ({
        url: type as string,
      }));
    }

    provide('map', map);

    return {
      mapRef,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/widget";

.main {
  height: 100vh;
  width: 100vw;
  position: relative;
}

.map {
  height: 100%;
  width: 100%;
  margin: unset;
  border: unset;
}

</style>