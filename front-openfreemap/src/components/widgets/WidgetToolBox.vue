<template>
  <div class='toolBox'>
    <div class='toolBox__compass'>
      <img :src="require('@/assets/ic_compass.png')">
    </div>
    <div class='toolBox__z'>
      <img :src="require('@/assets/ic_z.png')">
    </div>
    <div class='toolBox__ruler' @click='onRulerSelected'>
      <img :src="require('@/assets/ic_ruler.png')">
    </div>
    <div class='toolBox__geolocation'>
      <img :src="require('@/assets/ic_geolocation.png')">
    </div>
  </div>
</template>

<script lang='ts'>
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WidgetToolBox',
  setup(){
    const source = new VectorSource();
    const vector = new VectorLayer({
      source: source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)',
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33',
          }),
        }),
      }),
    });
    
    function onGPSSelected() {
      // https://openlayers.org/en/latest/examples/geolocation.html

    }

    function onRulerSelected(){
      // https://openlayers.org/en/latest/examples/measure.html
    }

    function onCompassSelected() {
      // hidden in Main.vue
    }

    return{
      onRulerSelected
    }
  }
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/widget";

%circleBox {
  @extend %box;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #c5c5c5;
    mix-blend-mode: difference;
  }
}

.toolBox {
  &__compass {
    @extend %circleBox;
    left: 125px;
    bottom: 25px;
  }

  &__z {
    @extend %circleBox;
    left: 115px;
    bottom: 80px;
  }

  &__ruler {
    @extend %circleBox;
    left: 75px;
    bottom: 125px;
  }

  &__geolocation {
    @extend %circleBox;
    left: 15px;
    bottom: 135px;
  }
}
</style>