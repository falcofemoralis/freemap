<template lang="">
<slot>

</slot>
</template>

<script>
import { provide, inject, watch, onMounted, onUnmounted, computed } from "vue";

import Select from "ol/interaction/Select";
import Style from "ol/style/Style";
import usePropsAsObjectProperties from "@/openlayers/composables/usePropsAsObjectProperties";
import Collection from "ol/Collection";
export default {
  name: "ol-interaction-select",
  emits: ["select"],
  setup(props, { emit }) {
    const map = inject("map");

    const { properties } = usePropsAsObjectProperties(props);

    let select = computed(() => {
      let s = new Select({
        ...properties,
        style: new Style(),
        filter: function (feature) {
          const featureExtent = feature.getGeometry().getExtent();
          const mapExtent = map.getView().calculateExtent(map.getSize());

          return (
            featureExtent[0] - mapExtent[0] > 0 &&
            featureExtent[1] - mapExtent[1] > 0
          );
        },
      });

      s.on("select", (event) => {
        emit("select", event);
      });

      return s;
    });

    watch(select, (newVal, oldVal) => {
      map.removeInteraction(oldVal);
      map.addInteraction(newVal);

      map.changed();
    });

    onMounted(() => {
      map.addInteraction(select.value);
    });

    onUnmounted(() => {
      map.removeInteraction(select.value);
    });

    provide("stylable", select);
  },
  props: {
    multi: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: Function,
    },
    filter: {
      type: Function,
    },
    features: {
      type: [Collection, Object],
    },
  },
};
</script>

<style lang="">
</style>
