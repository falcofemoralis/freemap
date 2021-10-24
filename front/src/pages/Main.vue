<template>
  <div class="main">
    <Map @saveObject="saveObjectListener" />
    <WidgetSearchBox />
    <WidgetLayersBox />
    <WidgetEditorBox />
    <WidgetToolsBox />
  </div>
</template>

<script>
import Map from "@/components/Map.vue";
import WidgetEditorBox from "@/components/WidgetEditorBox.vue";
import WidgetSearchBox from "@/components/WidgetSearchBox.vue";
import WidgetLayersBox from "@/components/WidgetLayersBox.vue";
import WidgetToolsBox from "@/components/WidgetToolsBox.vue";

import { MapApi } from "@/services/MapService.js";

export default {
  components: {
    Map,
    WidgetEditorBox,
    WidgetSearchBox,
    WidgetLayersBox,
    WidgetToolsBox,
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