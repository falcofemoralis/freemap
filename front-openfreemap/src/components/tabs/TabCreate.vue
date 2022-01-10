<template>
  <div class="tab">
    <input v-model="name" placeholder="Enter name" />
    <button @click="complete">Complete</button>
    type subtype address links media
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TabCreate',
  setup(props: any, context: any) {
    const name = ref('');

    function complete() {
      context.emit('created', name.value);
    }

    return {
      name,

      complete
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