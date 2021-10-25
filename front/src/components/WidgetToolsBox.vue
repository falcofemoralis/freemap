<template>
  <div class="toolsBox">
    <div class="toolsBox__map"></div>
    <div class="toolsBox__compass"></div>
    <div class="toolsBox__z"></div>
    <div class="toolsBox__ruler"></div>
    <div class="toolsBox__geolocation"></div>
  </div>
</template>

<script>
export default {
  name: "WidgetToolsBox",
};
</script>

<style lang="scss" scoped>
@import "@/styles/interface/widgets";

%circleBox {
  @extend %box;
  width: 40px;
  height: 40px;
  border-radius: 40px;
}

.toolsBox {
  &__map {
    @extend %box;
    width: 90px;
    height: 90px;
    right: 60px;
    bottom: 25px;
  }

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