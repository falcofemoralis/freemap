<template>
  <ol-map
    class="map__layout"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
  >
    <ol-view ref="view" :rotation="0" :zoom="4" projection="EPSG:3857" />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <!-- CREATING LAYER -->
    <ol-vector-layer>
      <ol-source-vector projection="EPSG:3857">
        <ol-interaction-draw v-if="drawEnable" :type="type" @drawend="drawend">
        </ol-interaction-draw>
      </ol-source-vector>

      <ol-style :zIndex="5">
        <ol-style-stroke color="red" :width="2"></ol-style-stroke>
        <ol-style-fill color="rgba(255,255,255,0.1)"></ol-style-fill>
        <ol-style-circle :radius="7">
          <ol-style-fill color="blue"></ol-style-fill>
        </ol-style-circle>
        <ol-style-text>
          <ol-style-fill color="#fff"></ol-style-fill>
        </ol-style-text>
      </ol-style>
    </ol-vector-layer>

    <!-- DATA LAYER -->
    <ol-vector-layer>
      <ol-source-vector
        :format="geoJson"
        url="http://localhost:3000/api/map/data"
      >
      </ol-source-vector>

      <ol-style :overrideStyleFunction="overrideStyleFunction">
        <ol-style-stroke color="green" :width="3"></ol-style-stroke>
        <ol-style-fill color="rgba(255,255,255,0.1)"></ol-style-fill>
        <ol-style-text>
          <ol-style-fill color="#fff"></ol-style-fill>
        </ol-style-text>
      </ol-style>
    </ol-vector-layer>
  </ol-map>
</template>

<script>
import { ref, watch, inject } from "vue";
import EditorObjectType from "@/constants/EditorObjectType.js";

export default {
  name: "Map",
  props: {
    drawEnable: Boolean,
    selectedType: String,
  },
  setup(props, context) {
    const type = ref("Polygon");
    const format = inject("ol-format");
    const geoJson = new format.GeoJSON();

    const overrideStyleFunction = (feature, style) => {
      style.getText().setText(feature.get("name"));
    };

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

      console.log(event.target.sketchCoords_);
      const obj = {
        coordinates: event.target.sketchCoords_,
        name: name,
        type: event.target.type_,
      };

      context.emit("saveObject", obj);
    }

    return {
      drawend,
      type,
      geoJson,
      overrideStyleFunction,
    };
  },
};
</script>

<style lang="scss" scoped></style>
