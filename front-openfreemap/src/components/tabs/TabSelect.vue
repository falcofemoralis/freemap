<template>
  <div class="tab">
    {{ text }}
    <button @click="close">Close</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TabSelect',
  setup(props: any, context: any) {
    const text = ref('hello');

    function close() {
      context.emit('close');
    }

    return {
      text,

      close
    };
  }
});
</script>

<style lang="scss" scoped>
.tab {
  z-index: 5;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 400px;
  height: 100%;
  background: #fff;
  box-shadow: 0px 4px 22px rgba(0, 0, 0, 0.25);
}
</style>