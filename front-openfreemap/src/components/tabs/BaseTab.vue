<template>
  <div class="baseTab">
    <button class="closeBtn" @click="$emit('close')"></button>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTab',
  setup(props: any, context: any) {
    return {};
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/tab.scss";
@import "~@/styles/interface/elements.scss";

.baseTab {
  @extend %tab;
}
</style>