<template>
  <Main />
</template>

<script lang='ts'>
import { defineComponent } from 'vue';
import Main from '@/views/Main.vue';

export default defineComponent({
  components: {
    Main,
  },
});
</script>

<style lang='scss'>
*,
*::after,
*::before {
  font-family: Roboto, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  list-style: none;
  text-decoration: none;
}

html,
body {
  height: 100vh;
}

body {
  scroll-behavior: smooth;
  overflow-x: hidden;
}
</style>
