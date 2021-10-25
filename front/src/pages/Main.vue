<template>
  <div class="main">
    <Map @saveObject="saveObjectListener" />
    <WidgetSearchBox />
    <WidgetLayersBox />
    <WidgetEditorBox />
    <WidgetToolBox />
  </div>
</template>

<script>
import Map from "@/components/Map.vue";
import WidgetEditorBox from "@/components/WidgetEditorBox.vue";
import WidgetSearchBox from "@/components/WidgetSearchBox.vue";
import WidgetLayersBox from "@/components/WidgetLayersBox.vue";
import WidgetToolBox from "@/components/WidgetToolBox.vue";

import { MapApi } from "@/services/MapService.js";

export default {
  components: {
    Map,
    WidgetEditorBox,
    WidgetSearchBox,
    WidgetLayersBox,
    WidgetToolBox,
  },
  setup() {
    /**
     * Листенер сохранения объекта.
     * @param {Object} obj - новый созданный объект.
     */
    function saveObjectListener(obj) {
      MapApi.addMapData(obj);
    }

    return {
      saveObjectListener,
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