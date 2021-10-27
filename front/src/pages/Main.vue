<template>
  <div class="main">
    <Map />
    <WidgetSearchBox />
    <WidgetLayersBox />
    <WidgetEditorBox />
    <WidgetToolBox />
    <TabCreate @createComplete="createCompleteListener" />
  </div>
</template>

<script>
import Map from "@/components/Map.vue";
import WidgetEditorBox from "@/components/WidgetEditorBox.vue";
import WidgetSearchBox from "@/components/WidgetSearchBox.vue";
import WidgetLayersBox from "@/components/WidgetLayersBox.vue";
import WidgetToolBox from "@/components/WidgetToolBox.vue";
import TabCreate from "@/components/TabCreate.vue";
import { MapApi } from "@/services/MapService.js";

export default {
  components: {
    Map,
    WidgetEditorBox,
    WidgetSearchBox,
    WidgetLayersBox,
    WidgetToolBox,
    TabCreate,
  },
  setup() {
    /**
     * Отправка нового объекта на сервер
     * @param {Object} obj - новый объект
     */
    function createCompleteListener(obj) {
      MapApi.addMapData(obj);
    }

    return {
      createCompleteListener,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/interface/widgets";

.main {
  height: 100vh;
  width: 100vw;
  position: relative;
}
</style>