<template>
  <div class='modal'>
    <div class='innerModal'>
      <button class='close' @click="$emit('close')"></button>
      <slot></slot>
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseModal',
  setup() {
    return {};
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/modal.scss";
@import "~@/styles/interface/elements.scss";
@import "~@/styles/base.scss";

.close {
  @extend %closeBtn;
  right: 5px;
  top: 5px;
}

.innerModal {
  @extend %shadow;
  position: relative;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 15px;
}
</style>