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
@import "~@/styles/interface/tabs.scss";
</style>