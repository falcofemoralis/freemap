<template>
  <div class="layersBox">
    <button
      v-if="currentMapType != MapType.OSM"
      @click="changeCurrentMapType(MapType.OSM)"
    >
      osm
    </button>
    <button v-else @click="changeCurrentMapType(MapType.GOOGLE)">google</button>
  </div>
</template>

<script>
import { ref } from "vue";
import MapType from "@/constants/MapType.js";
import { useStore } from "vuex";

export default {
  name: "WidgetLayersBox",
  setup() {
    const store = useStore();
    const currentMapType = ref(MapType.OSM);
    store.dispatch("setMapType", currentMapType.value);

    /**
     * Смена типа текущей карты
     * @param {MapType} type - тип карты на которую будет менятся текущая карта
     */
    function changeCurrentMapType(type) {
      currentMapType.value = type;
      store.dispatch("setMapType", type);
    }

    return {
      MapType,
      currentMapType,

      changeCurrentMapType,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/interface/widgets";

.layersBox {
  @extend %box;
  bottom: 25px;
  left: 15px;
  width: 80px;
  height: 80px;
}
</style>