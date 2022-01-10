<template>
  <div class="searchBox"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WidgetSearchBox'
});
</script>
<style lang="scss" scoped>
@import "~@/styles/interface/widgets";

.searchBox {
  @extend %box;
  width: 400px;
  height: 50px;
  left: 5px;
  top: 10px;
}
</style>