<template>
  <ol-map
    class="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
  >
    <ol-view
      ref="view"
      projection="EPSG:3857"
      @centerChanged="posChangedListener"
    />

    <!-- Map Layer -->
    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <!-- Create Layer -->
    <ol-vector-layer>
      <ol-source-vector projection="EPSG:3857">
        <ol-interaction-draw
          v-if="drawType"
          :type="drawType"
          @drawend="drawendListener"
        >
        </ol-interaction-draw>
      </ol-source-vector>

      <ol-style :overrideStyleFunction="overrideStyleFunction">
        <ol-style-stroke color="black" :width="2"></ol-style-stroke>
        <ol-style-fill color="rgba(255,0,0,0.1)"></ol-style-fill>
        <ol-style-text>
          <ol-style-stroke :width="3"></ol-style-stroke>
          <ol-style-fill color="#FF1A00"></ol-style-fill>
        </ol-style-text>
      </ol-style>
    </ol-vector-layer>

    <!-- Select Layer -->
    <!--    <ol-interaction-select
      @select="featureSelectedListener"
      :condition="selectCondition"
    >
      <ol-style>
        <ol-style-stroke color="green" :width="10"></ol-style-stroke>
        <ol-style-fill color="rgba(255,255,255,0.5)"></ol-style-fill>
      </ol-style>
    </ol-interaction-select> -->

    <!-- Hover Layer -->
    <ol-interaction-select :condition="hoverCondition">
      <ol-style>
        <ol-style-stroke color="yellow" :width="10"></ol-style-stroke>
        <ol-style-fill color="rgba(255,0,0,0.5)"></ol-style-fill>
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
          <ol-style-stroke :width="3"></ol-style-stroke>
          <ol-style-fill color="#FF1A00"></ol-style-fill>
        </ol-style-text>
      </ol-style>
    </ol-vector-layer>
  </ol-map>
</template>

<script>
import { ref, watch, inject, computed } from "vue";
import EditorObjectType from "@/constants/EditorObjectType.js";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";

export default {
  name: "Map",
  setup(props, context) {
    const store = useStore();
    const view = ref(null);
    const format = inject("ol-format");
    const geoJson = new format.GeoJSON();
    const drawType = ref(null);
    const router = useRouter();
    const route = useRoute();
    const selectConditions = inject("ol-selectconditions");
    const selectCondition = selectConditions.click;
    const hoverCondition = selectConditions.pointerMove;
    let pathChanged = false;

    /**
     * Отслеживание измненение координат в url. Метод срабатывает при первичном заходе на сайт.
     * Карта будет выставленна в соотвествии с координатами и зумом из параметров url
     */
    const query = computed(() => route.query);
    const queryWatch = watch(query, (updatedquery) => {
      if (updatedquery.pos && updatedquery.z) {
        view.value.setCenter(updatedquery.pos.split(","));
        view.value.setZoom(updatedquery.z);
        queryWatch();
      }
    });

    /**
     * Отслеживание выбраного типа при создании объекта
     */
    const selectedType = computed(() => store.getters.getSelectedType);
    watch(selectedType, (current) => {
      console.log(current);
      switch (current) {
        case EditorObjectType.PATH:
          drawType.value = "LineString";
          break;
        case EditorObjectType.BUILDING:
          drawType.value = "Polygon";
          break;
        default:
          drawType.value = null;
      }
    });
    /**
     * Листенер завершения создания объекта
     * @param {Object} event - Созданный объект openlayers
     */
    function drawendListener(event) {
      const name = prompt("prompt", "Enter place name");
      const obj = {
        coordinates: event.target.sketchCoords_,
        name: name,
        type: event.target.type_,
      };

      event.feature.setProperties({
        name: name,
      });

      store.dispatch("setSelectedtype", null);
      context.emit("saveObject", obj);
    }

    /**
     * Метод переопределения стиля
     * @param {Object} feature - Объект данных
     * @param {Object} style - Объект стиля
     */
    function overrideStyleFunction(feature, style) {
      const text = style.getText();
      const featureName = feature.get("name");

      if (featureName) {
        text.setText(featureName);
      }
    }

    /**
     * Листенер выбора данных
     * @param {Object} feature - Объект данных
     */
    function featureSelectedListener() {
      //console.log(event);
    }

    /**
     * Листенер изменения координат. Меняется текущий url с добавление координат и текущего зума
     * @param {Array} сoordinates - Координаты
     */
    function posChangedListener(сoordinates) {
      if (!pathChanged) {
        if (сoordinates) {
          router.replace(`?pos=${сoordinates}&z=${view.value.getZoom()}`);
        }

        pathChanged = true;

        // Измненения url каждые 250 мс
        setTimeout(() => {
          pathChanged = false;
        }, 250);
      }
    }

    return {
      view,
      drawType,
      geoJson,
      selectCondition,
      hoverCondition,

      drawendListener,
      overrideStyleFunction,
      featureSelectedListener,
      posChangedListener,
    };
  },
};
</script>

<style lang="scss" scoped>
.map {
  z-index: 0;
  height: 100%;
  width: 100%;
}
</style>
