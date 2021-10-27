<template>
  <div class="main">
    <Map @saveObject="saveObjectListener" />
    <WidgetSearchBox />
    <WidgetLayersBox />
    <WidgetEditorBox />
    <WidgetToolBox />
    <TabCreate
      :createdObject="createdObject"
      @completeCreate="completeCreateListener"
    />
  </div>
</template>

<script>
import { ref } from "vue";
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
    const createdObject = ref(null);
    let createdFeature = null;

    /**
     * Листенер сохранения объекта.
     * @param {Object} obj - новый созданный объект.
     * @param {Object} feature - объект карты
     */
    function saveObjectListener(obj, feature) {
      createdObject.value = obj;
      createdFeature = feature;
    }

    function completeCreateListener(obj) {
      createdFeature.setProperties({
        name: obj.name,
      });

      createdObject.value = null;
      createdFeature = null;

      MapApi.addMapData(obj);
    }

    return {
      createdObject,
      createdFeature,

      saveObjectListener,
      completeCreateListener,
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