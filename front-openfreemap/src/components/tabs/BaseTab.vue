<template>
  <div class="tab">
    <button class="close-btn" @click="$emit('close')"></button>
    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'BaseTab',
  setup(props: any, context: any) {
    return {};
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/tab.scss";

.close-btn {
  display: inline-block;
  position: absolute;
  height: 24px;
  width: 24px;
  background-size: 24px;
  background-image: url(https://fonts.gstatic.com/s/i/googlematerialicons/clear/v9/gm_grey-24dp/1x/gm_clear_gm_grey_24dp.png);
  right: 24px;
  cursor: pointer;
  opacity: .8;
  border: 0;
  border-radius: 0;
  font: inherit;
  list-style: none;
  margin: 0;
  outline: 0;
  overflow: visible;
  padding: 0;
  vertical-align: baseline;

  &:hover {
    opacity: 1;
  }
}
</style>