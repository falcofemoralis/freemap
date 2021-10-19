<template lang="">
<div>
    <slot></slot>
</div>
</template>

<script>
import { inject, provide, onUnmounted, onMounted, watch, computed } from "vue";

import VectorLayer from "ol/layer/Vector";
import usePropsAsObjectProperties from "@/openlayers/composables/usePropsAsObjectProperties";
//import { Stroke, Style, Text } from "ol/style";

export default {
  name: "ol-vector-layer",
  setup(props) {
    const map = inject("map");

    const { properties } = usePropsAsObjectProperties(props);

    /*     const createTextStyle = function (feature) {
      console.log(feature);
      return new Text({
        text: feature.get("name"),
      });
    };

    function lineStyleFunction(feature) {
      return new Style({
        stroke: new Stroke({
          color: "green",
          width: 2,
        }),
        text: createTextStyle(feature),
      });
    }

    properties.style = lineStyleFunction; */
    const vectorLayer = computed(() => new VectorLayer(properties));

    watch(properties, () => {
      vectorLayer.value.setProperties(properties);
    });

    onMounted(() => {
      map.addLayer(vectorLayer.value);
    });

    onUnmounted(() => {
      map.removeLayer(vectorLayer.value);
    });

    provide("vectorLayer", vectorLayer);
    provide("stylable", vectorLayer);

    return {
      vectorLayer,
    };
  },
  props: {
    className: {
      type: String,
      default: "ol-layer",
    },
    opacity: {
      type: Number,
      default: 1,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    extent: {
      type: Array,
    },
    zIndex: {
      type: Number,
    },
    minResolution: {
      type: Number,
    },
    maxResolution: {
      type: Number,
    },
    minZoom: {
      type: Number,
    },
    maxZoom: {
      type: Number,
    },
    renderBuffer: {
      type: Number,
      default: 100,
    },
    updateWhileAnimating: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Function,
    },
    updateWhileInteracting: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    name: {
      type: String,
    },
    preview: {
      type: String,
    },
    baseLayer: {
      type: Boolean,
    },
  },
};
</script>

<style lang="">
</style>
