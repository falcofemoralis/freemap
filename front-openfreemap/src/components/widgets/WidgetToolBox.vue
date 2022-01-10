<template>
  <div class="toolBox">
    <div class="toolBox__compass"></div>
    <div class="toolBox__z"></div>
    <div class="toolBox__ruler"></div>
    <div class="toolBox__geolocation"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WidgetToolBox'
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/widgets";

%circleBox {
  @extend %box;
  width: 40px;
  height: 40px;
  border-radius: 40px;
}

.toolBox {
  &__compass {
    @extend %circleBox;
    right: 170px;
    bottom: 25px;
  }

  &__z {
    @extend %circleBox;
    right: 160px;
    bottom: 80px;
  }

  &__ruler {
    @extend %circleBox;
    right: 120px;
    bottom: 125px;
  }

  &__geolocation {
    @extend %circleBox;
    right: 60px;
    bottom: 135px;
  }
}
</style>