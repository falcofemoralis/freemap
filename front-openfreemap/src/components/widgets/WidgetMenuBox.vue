<template>
  <div>
    <Animation>
      <TabMenu v-if='isMenuOpen' @close='toggleMenu' />
    </Animation>
    <div class='menuBox'>
      <img class='menuBtn' :src="require('@/assets/menu.png')" alt='menu' @click='toggleMenu'>
    </div>
  </div>
</template>

<script lang='ts'>
import TabMenu from '@/components/tabs/TabMenu.vue';
import { ref } from 'vue';
import Animation from '@/components/elements/Animation.vue';

export default {
  name: 'WidgetMenuBox',
  components: { Animation, TabMenu },
  setup() {
    const isMenuOpen = ref(false);

    function toggleMenu() {
      isMenuOpen.value = !isMenuOpen.value;
    }

    return {
      isMenuOpen,

      toggleMenu,
    };
  },

};
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/widget";

.menuBox {
  @extend %box;
  background: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  width: 50px;
  height: 50px;
  left: 5px;
  top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.menuBtn {
  cursor: pointer;
  width: 25px;
  height: 25px;
}
</style>