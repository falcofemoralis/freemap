<template>
  <div class="layersBox" @click="changeMapType">
    <div class="layersBox__label">
      <span v-if="selectedMapType === MapType.GOOGLE">Земля</span>
      <span v-else>Карта</span>
    </div>
  </div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue';
import MapType from '@/constants/MapType';
import { OverviewMap } from 'ol/control';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';

export default  defineComponent({
  name: 'WidgetPreviewBox',
  setup() {
    const store = useStore();
    const map = inject<Map>('map');
    const selectedMapType = ref<MapType>(store.getters.getMapType); // тип выбранной карты

    /* Map preview init */
    const baseLayer = new TileLayer();
    const mapPreview = new OverviewMap({
      className: 'layers-map',
      collapsed: false,
      collapsible: false,
      rotateWithView: false
    });
    mapPreview.getOverviewMap().addLayer(baseLayer);

    onMounted(() => {
      if (map) {
        mapPreview.setMap(map); // attach main map
        setPreviewMapLayer(selectedMapType.value); //
      }
    });

    /**
     * Установка нового слоя превью карты
     * @param {MapType} type - тип карты (Земля\OSM)
     */
    function setPreviewMapLayer(type: MapType) {
      baseLayer.setSource(new XYZ({
        url: type as string
      }));
    }

    /**
     * Измненение типа текущей карты (Земля\OSM)
     */
    function changeMapType(): void {
      if (selectedMapType.value == MapType.OSM) {
        selectedMapType.value = MapType.GOOGLE;
      } else {
        selectedMapType.value = MapType.OSM;
      }

      setPreviewMapLayer(selectedMapType.value);
      store.dispatch('setMapType', selectedMapType.value);
    }

    return {
      MapType,

      selectedMapType,

      changeMapType
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/widgets";

.layersBox {
  @extend %box;
  bottom: 25px;
  left: 15px;
  width: 76px;
  height: 76px;
  cursor: pointer;
  background: rgba($color: #000000, $alpha: 0.2);
  border: #fff solid 2px;

  &__label {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    top: 70%;
    color: #fff;
  }
}
</style>

<style lang="scss">
@import "~@/styles/interface/widgets";

%olmap {
  border-radius: $box-corner !important;
  position: absolute !important;

  .ol-overviewmap-map {
    height: 100% !important;
    width: 100% !important;
    margin: unset !important;
    border: unset !important;
  }

  .ol-layer canvas {
    height: 100% !important;
    width: 100% !important;
    border-radius: $box-corner !important;
  }

  button {
    display: none !important;
  }
}

.layers-map {
  @extend %olmap;
  bottom: 25px !important;
  left: 15px !important;
  width: 80px !important;
  height: 80px !important;
  right: unset !important;
  background-color: rgba(255, 255, 255, 0) !important;
  padding: unset !important;
  /*  .ol-overlaycontainer-stopevent {
    display: none;
  } */
}
</style>