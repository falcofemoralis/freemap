<template>
  <div class="main">
    <Map
      class="main__map"
      :drawEnable="drawEnable"
      :selectedType="selectedType"
      @saveObject="saveObjectListener"
    />
    <div class="main__searchBox"></div>
    <div class="main__layersBox"></div>
    <div class="main__editorBox rcc">
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
    <div v-if="drawEnable" class="main__editorCtrlBox">
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
        @click="redo()"
        alt="redo"
      />
    </div>
    <div class="main__toolsBox"></div>
  </div>
</template>

<script>
import { ref } from "vue";
import Map from "@/components/Map.vue";
import EditorObjectType from "@/constants/EditorObjectType.js";
import { MapApi } from "@/services/MapService.js";

export default {
  components: {
    Map,
  },
  setup() {
    const drawEnable = ref(false); // Логическое значение включеного редактора создания объекта
    const selectedType = ref(null); // Выбранный тип создаваемого объекта

    /**
     * Включение создания нового объекта.
     * @param {EditorObjectType} type - Тип создаваемого объекта.
     */
    function createObject(type) {
      drawEnable.value = true;
      selectedType.value = type;
    }

    /**
     * Листенер сохранения объекта.
     * @param {Object} obj - новый созданный объект.
     */
    function saveObjectListener(obj) {
      drawEnable.value = false;
      MapApi.addMapData(obj);
    }

    /**
     * Отмена отмены действия при создании объекта
     */
    function redo() {}

    /**
     * Отмена действия при создании объекта
     */
    function undo() {}

    /**
     * Прослушиватель нажатой клавиши ESC.
     * При ее нажатии будет прекращенно создание объекта.
     */
    window.addEventListener("keyup", function (event) {
      if (event.key === "Escape") {
        drawEnable.value = false;
      }
    });

    return {
      drawEnable,
      selectedType,
      EditorObjectType,

      createObject,
      saveObjectListener,
      redo,
      undo,
    };
  },
};
</script>

<style lang="scss" scoped>
$box-corner: 15px;

%box {
  z-index: 1;
  position: absolute;
  background: rgba(247, 250, 255, 0.98);
  box-shadow: 0px 4px 22px rgba(0, 0, 0, 0.25);
  border-radius: $box-corner;
}

.main {
  height: 100vh;
  width: 100vw;
  position: relative;

  &__map {
    z-index: 0;
    height: 100%;
    width: 100%;
  }

  &__searchBox {
    @extend %box;
    width: 400px;
    height: 50px;
    left: 5px;
    top: 10px;
  }

  &__layersBox {
    @extend %box;
    bottom: 25px;
    left: 15px;
    width: 80px;
    height: 80px;
  }

  &__editorBox {
    @extend %box;
    bottom: 25px;
    left: 125px;
    width: auto;
    height: auto;
  }

  &__editorCtrlBox {
    @extend %box;
    width: auto;
    height: 55px;
    bottom: 25px;
    left: 315px;
  }
}

.box__btn {
  width: 35px;
  height: 35px;
  padding: 10px;
  cursor: pointer;
  background: #ffffff00;
  transition: all 0.3s;

  &:hover {
    background: #c5c5c5;
    mix-blend-mode: difference;
  }

  &-left {
    border-radius: $box-corner 0 0 $box-corner;
  }

  &-right {
    border-radius: 0 $box-corner $box-corner 0;
  }
}
</style>