<template>
  <div class="layersBox" @click="changeCurrentMapType">
    <div class="layersBox__label">
      <span class="layersBox__label-text" v-if="currentMapType == MapType.OSM"
        >Карта</span
      >
      <span class="layersBox__label-text" v-else>Земля</span>
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
  position: absolute;
  bottom: 25px;
  left: 15px;
  width: 80px;
  height: 80px;
  cursor: pointer;

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