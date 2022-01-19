<template>
  <div class='baseTab'>
    <div class='closeCont'>
      <button class='close' @click="$emit('close')"></button>
    </div>
    <slot></slot>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTab',
  setup(props: any, context: any) {
    return {};
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/tab.scss";
@import "~@/styles/interface/elements.scss";

.baseTab {
  @extend %tab;
}

.close{
  @extend %closeBtn;
}

.closeCont {
  top: 0;
  right: 0;
  position: absolute;
  height: 50px;
  width: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
}

</style>