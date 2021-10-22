<template>
  <ol-map
    class="map__layout"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
  >
    <ol-view ref="view" projection="EPSG:3857" @centerChanged="centerChanged" />

    <!-- Map Layer -->
    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <!-- Create Layer -->
    <ol-vector-layer>
      <ol-source-vector projection="EPSG:3857">
        <ol-interaction-draw v-if="drawEnable" :type="type" @drawend="drawend">
        </ol-interaction-draw>
      </ol-source-vector>

      <ol-style :overrideStyleFunction="overrideStyleFunction">
        <ol-style-stroke color="black" :width="2"></ol-style-stroke>
        <ol-style-fill color="rgba(255,0,0,0.1)"></ol-style-fill>
        <ol-style-text>
          <ol-style-fill color="#fff"></ol-style-fill>
        </ol-style-text>
      </ol-style>
    </ol-vector-layer>

    <!-- Select Layer -->
    <ol-interaction-select
      @select="featureSelected"
      :condition="selectCondition"
    >
      <ol-style>
        <ol-style-stroke color="green" :width="10"></ol-style-stroke>
        <ol-style-fill color="rgba(255,255,255,0.5)"></ol-style-fill>
      </ol-style>
    </ol-interaction-select>

    <!-- Data Layer -->
    <ol-vector-layer :renderBuffer="1000">
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
import { ref, watch, inject, computed } from "vue";
import EditorObjectType from "@/constants/EditorObjectType.js";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "Map",
  props: {
    drawEnable: Boolean,
    selectedType: String,
  },
  setup(props, context) {
    const view = ref(null);
    const format = inject("ol-format");
    const geoJson = new format.GeoJSON();
    const type = ref("Polygon");
    const selectCondition = inject("ol-selectconditions").click;
    const router = useRouter();
    const route = useRoute();

    const query = computed(() => route.query);
    const queryWatch = watch(query, (updatedquery) => {
      if (updatedquery.pos && updatedquery.z) {
        view.value.setCenter(updatedquery.pos.split(","));
        view.value.setZoom(updatedquery.z);
        queryWatch();
      }
    });

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
        coordinates: event.target.sketchCoords_,
        name: name,
        type: event.target.type_,
      };

      event.feature.setProperties({
        name: name,
      });

      context.emit("saveObject", obj);
    }

    function overrideStyleFunction(feature, style) {
      const text = style.getText();
      const featureName = feature.get("name");

      if (featureName) {
        text.setText(featureName);
      }
    }

    function featureSelected() {
      //console.log(event);
    }

    let pathChanged = false;
    function centerChanged(center) {
      if (!pathChanged) {
        if (center) {
          router.replace(`?pos=${center}&z=${view.value.getZoom()}`);
        }

        pathChanged = true;

        setTimeout(() => {
          pathChanged = false;
        }, 250);
      }
    }

    return {
      drawend,
      overrideStyleFunction,
      featureSelected,
      centerChanged,

      view,
      type,
      geoJson,
      selectCondition,
    };
  },
};
</script>

<style lang="scss" scoped></style>
