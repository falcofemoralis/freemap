<template>
  <div>
    <div class="editorBox rcc">
      <img
        class="box__btn box__btn-left"
        :src="require('@/assets/ic_path.png')"
        @click="createObject(EditorObjectType.PATH)"
        alt="Add path"
      />
      <img
        class="box__btn"
        :src="require('@/assets/ic_polygon.png')"
        @click="createObject(EditorObjectType.BUILDING)"
        alt="Add building"
      />
      <img
        class="box__btn box__btn-right"
        :src="require('@/assets/ic_area.png')"
        @click="createObject(EditorObjectType.AREA)"
        alt="Add area"
      />
    </div>
    <div v-if="selectedType" class="editorCtrlBox">
      <img
        class="box__btn box__btn-left"
        :src="require('@/assets/ic_undo.png')"
        @click="undo()"
        alt="undo"
      />
      <img
        class="box__btn"
        :class="{ 'box__btn-right': selectedType != EditorObjectType.PATH }"
        :src="require('@/assets/ic_redo.png')"
        @click="redo()"
        alt="redo"
      />
      <img
        v-if="selectedType == EditorObjectType.PATH"
        class="box__btn box__btn-right"
        :src="require('@/assets/ic_completed.png')"
        @click="completed()"
        alt="redo"
      />
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import EditorObjectType from "@/constants/EditorObjectType.js";

export default {
  name: "WidgetEditorBox",
  setup() {
    const store = useStore();
    const selectedType = computed(() => store.getters.getSelectedType);
    let lastCoordinates = new Array();

    /**
     * Включение создания нового объекта.
     * @param {EditorObjectType} type - Тип создаваемого объекта.
     */
    function createObject(type) {
      store.dispatch("setSelectedtype", type);
    }

    //const draw = computed(() => store.getters.getDraw);

    /**
     * Отмена отмены действия при создании объекта
     */
    function redo() {
      const coordinates = lastCoordinates.pop();
      if (coordinates) {
        store.getters.getDraw.appendCoordinates(Array(coordinates));
      }
    }

    /**
     * Отмена действия при создании объекта
     */
    function undo() {
      const geometryCoordinates = store.getters.getGeometry.getCoordinates();

      if (geometryCoordinates.length > 1) {
        lastCoordinates.push(
          geometryCoordinates[geometryCoordinates.length - 2]
        );
        store.getters.getDraw.removeLastPoint();
      }
    }

    /**
     * Заврешения создания объекта (только для линий)
     */
    function completed() {
      store.getters.getDraw.finishDrawing();
    }

    /**
     * Прослушиватель нажатой клавиши ESC.
     * При ее нажатии будет прекращенно создание объекта.
     */
    window.addEventListener("keyup", function (event) {
      if (event.key === "Escape") {
        store.dispatch("setSelectedtype", null);
      }
    });

    return {
      EditorObjectType,
      selectedType,

      createObject,
      redo,
      undo,
      completed,
    };
  },
};
</script>

<style lang="scss" scoped>
@import "@/styles/interface/widgets";

.editorBox {
  @extend %box;
  bottom: 25px;
  left: 125px;
  width: auto;
  height: auto;
}

.editorCtrlBox {
  @extend %box;
  width: auto;
  height: 55px;
  bottom: 25px;
  left: 315px;
}
</style>