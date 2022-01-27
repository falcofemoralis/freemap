<template>
  <div>
    <Animation type='slide'>
      <Suspense v-if='isTabCreateOpen'>
        <template #default>
          <TabCreate @close='closeTab' :editType='selectedEditType' :coordinates='featureCoordinates'
                     :zoom='featureZoom'
                     @created='onCreatedHandler' />
        </template>
        <template #fallback>
          <TabLoading />
        </template>
      </Suspense>
    </Animation>
    <div class='editorBox rcc' v-if='store.getters.isTokenValid'>
      <img
        class='editorBtn editorBtn-left'
        :src="require('@/assets/ic_polygon.png')"
        @click='createEdit(EditType.BUILDING)'
        alt='Add building'
      />
      <img
        class='editorBtn'
        :src="require('@/assets/ic_path.png')"
        @click='createEdit(EditType.PATH)'
        alt='Add path'
      />
      <img
        class='editorBtn editorBtn-right'
        :src="require('@/assets/ic_area.png')"
        @click='createEdit(EditType.AREA)'
        alt='Add area'
      />
    </div>
    <div class='editorCtrlBox' v-if='selectedEditType'>
      <img
        class='editorBtn editorBtn-left'
        :src="require('@/assets/ic_undo.png')"
        @click='undo()'
        alt='undo'
      />
      <img
        class='editorBtn'
        :class="{ 'editorBtn-right': selectedEditType !== EditType.PATH }"
        :src="require('@/assets/ic_redo.png')"
        @click='redo()'
        alt='redo'
      />
      <img
        v-if='selectedEditType === EditType.PATH'
        class='editorBtn editorBtn-right'
        :src="require('@/assets/ic_completed.png')"
        @click='completeDrawing'
        alt='redo'
      />
    </div>
  </div>
</template>

<script lang='ts'>
import { useStore } from 'vuex';
import { defineComponent, inject, ref } from 'vue';
import Map from 'ol/Map';
import { Circle, Fill, Stroke, Style, Text } from 'ol/style';
import { Draw } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import GeometryType from '@/constants/GeometryType';
import { Feature } from 'ol';
import { DrawEvent } from 'ol/interaction/Draw';
import TabCreate from '@/components/tabs/TabCreate.vue';
import { Geometry, Polygon } from 'ol/geom';
import EditType from '@/constants/EditType';
import TabLoading from '@/components/tabs/TabLoading.vue';
import Animation from '@/components/elements/Animation.vue';
import { MapFeatureDto, ShortFeatureDataDto } from '@/dto/map/map-data.dto';

export default defineComponent({
  name: 'WidgetEditorBox',
  components: { Animation, TabLoading, TabCreate },
  setup() {
    const store = useStore();
    const map = inject<Map>('map');
    const selectedEditType = ref<EditType | null>(null); // выбранный тип создания объекта
    const featureCoordinates = ref<number[][][] | null>(null);
    const featureZoom = ref<number | null>(null);
    const isTabCreateOpen = ref<boolean>(false); // переключать бокового меню создания объекта
    const lastCoordinates = new Array<Array<number>>(); // координаты точек полигонов объекта геометрии
    let feature: Feature<Geometry> | null = null; // обьект геометрии на карте, который создается
    let draw: Draw; // взаимодействие с создаваемый обьектом геометрии

    const style = new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new Circle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33',
        }),
      }),
      text: new Text({
        font: '12px Calibri,sans-serif',
        fill: new Fill({ color: '#000' }),
        stroke: new Stroke({
          color: '#fff', width: 2,
        }),
      }),
    });

    /* Edit object init */
    const source = new VectorSource();
    const baseLayer = new VectorLayer({
      source,
      style: function(feature) {
        style.getText().setText(feature.get('name'));
        return [style];
      },
      renderBuffer: 5000,
    });
    map?.addLayer(baseLayer);

    /**
     * Инициализация создания нового объекта
     * @param {EditType} type - тип создаваемого объекта
     */
    function createEdit(type: EditType) {
      selectedEditType.value = type;
      if (!store.getters.getIsDrawing) {
        store.dispatch('toggleIsDrawing');
      }

      addInteractions(type);
    }

    /**
     * Добавление объекта Draw на карту
     * @param {EditType} type  - тип полигона
     */
    function addInteractions(type: EditType) {
      let geomType: GeometryType = GeometryType.POLYGON;
      switch (type) {
        case EditType.BUILDING:
        case EditType.AREA:
          geomType = GeometryType.POLYGON;
          break;
        case EditType.PATH:
          geomType = GeometryType.LINESTRING;
          break;
      }

      map?.removeInteraction(draw);

      draw = new Draw({
        source,
        type: geomType as string,
      });

      draw.on('drawstart', ((event: DrawEvent) => {
        feature = event.feature; // запоминание текущего создаваемого объекта геометрии
      }));

      draw.on('drawend', (() => {
        if (!isTabCreateOpen.value) {
          completeDrawing();
        }
      }));

      map?.addInteraction(draw);
    }

    /**
     * Завершение создания полигонов
     */
    function completeDrawing() {
      featureCoordinates.value = (feature?.getGeometry() as Polygon).getCoordinates();
      featureZoom.value = map?.getView()?.getZoom() ?? -1;
      isTabCreateOpen.value = true;
      draw.finishDrawing();
      map?.removeInteraction(draw);
    }

    /**
     * Обработчик завершения создания нового объекта геометрии
     * @param {MapFeatureDto} mapFeatureDto - созданный объект
     */
    async function onCreatedHandler(mapFeatureDto: MapFeatureDto<ShortFeatureDataDto>) {
      feature?.setProperties(mapFeatureDto.properties);

      // reset values
      feature = null;
      selectedEditType.value = null;
      isTabCreateOpen.value = false;
      await store.dispatch('toggleIsDrawing');
    }

    /**
     * Отмена действия при создании объекта
     */
    function undo() {
      const geometryCoordinates = (feature?.getGeometry() as Polygon)?.getCoordinates()[0];

      if (geometryCoordinates && geometryCoordinates.length > 1) {
        lastCoordinates.push(geometryCoordinates[geometryCoordinates.length - 2]);
        draw.removeLastPoint();
      }
    }

    /**
     * Отмена отмены действия при создании объекта
     */
    function redo() {
      const coordinates = lastCoordinates.pop();

      if (coordinates) {
        draw.appendCoordinates(Array(coordinates));
      }
    }

    /**
     * Переустановка данных в изначальную позицию
     */
    function resetDrawing() {
      draw.abortDrawing();
      map?.removeInteraction(draw);
    }

    /**
     * Прослушиватель нажатой клавиши ESC.
     * При ее нажатии будет прекращенно создание объекта.
     */
    window.addEventListener('keyup', function(event) {
      if (event.key === 'Escape') {
        if (selectedEditType.value) {
          selectedEditType.value = null;
          resetDrawing();
          store.dispatch('toggleIsDrawing');
        }
      }
    });

    /**
     * Закрытие вкладки создания объекта
     */
    function closeTab() {
      isTabCreateOpen.value = false;
      selectedEditType.value = null;

      if (feature) {
        baseLayer?.getSource().removeFeature(feature);
      }
      resetDrawing();

      store.dispatch('toggleIsDrawing');
    }

    return {
      EditType,

      store,
      selectedEditType,
      isTabCreateOpen,
      featureCoordinates,
      featureZoom,

      createEdit,
      onCreatedHandler,
      completeDrawing,
      undo,
      redo,
      closeTab,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/widget";

.editorBox {
  @extend %box;
  display: flex;
  bottom: 25px;
  left: 180px;
  width: auto;
  height: auto;
}

.editorCtrlBox {
  @extend %box;
  width: auto;
  height: 55px;
  bottom: 25px;
  left: 370px;
}

.editorBtn {
  @extend %button;
  width: 35px;
  height: 35px;
  padding: 10px;
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
