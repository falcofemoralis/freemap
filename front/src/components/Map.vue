<template>
  <ol-map
    class="map__layout"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
  >
    <ol-view ref="view" :zoom="2" />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-vector-layer>
      <ol-source-vector>
        <ol-interaction-draw v-if="drawEnable" :type="type" @drawend="drawend">
        </ol-interaction-draw>
      </ol-source-vector>

      <ol-style :zIndex="5">
        <ol-style-stroke color="red" :width="2"></ol-style-stroke>
        <ol-style-fill color="rgba(255,255,255,0.1)"></ol-style-fill>
        <ol-style-circle :radius="7">
          <ol-style-fill color="blue"></ol-style-fill>
        </ol-style-circle>
        <ol-style-text
          :scale="3"
          :overflow="true"
          font="Roboto"
        ></ol-style-text>
      </ol-style>
    </ol-vector-layer>
  </ol-map>
</template>

<script>
import { ref, watch } from "vue";
import EditorObjectType from "@/constants/EditorObjectType.js";

export default {
  name: "Map",
  props: {
    drawEnable: Boolean,
    selectedType: String,
  },
  setup(props, context) {
    const type = ref("Polygon");

    watch(
      () => props.selectedType,
      (current) => {
        switch (current) {
          case EditorObjectType.PATH:
            type.value = "LineString";
            break;
          case EditorObjectType.BUILDING:
            type.value = "Polygon";
            break;
        }
      }
    );

    function drawend(event) {
      const name = prompt("prompt", "Enter place name");
      const obj = {
        coord: event.target.sketchCoords_,
        name: name,
      };

      context.emit("saveObject", obj);
    }

    return {
      drawend,
      type,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>