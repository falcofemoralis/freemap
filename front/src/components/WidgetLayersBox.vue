<template>
  <div class="layersBox" @click="changeCurrentMapType">
    <div class="layersBox__label">
      <span v-if="currentMapType == MapType.GOOGLE">Земля</span>
      <span v-else>Карта</span>
    </div>
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
     */
    function changeCurrentMapType() {
      if (currentMapType.value == MapType.OSM) {
        currentMapType.value = MapType.GOOGLE;
      } else {
        currentMapType.value = MapType.OSM;
      }

      store.dispatch("setMapType", currentMapType.value);
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