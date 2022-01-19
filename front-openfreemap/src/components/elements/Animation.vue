<template>
  <transition name='slide'>
    <slot></slot>
  </transition>
</template>

<script lang='ts'>
export default {
  name: 'Animation',
};
</script>

<style lang='scss'>
@import "~@/styles/interface/tab.scss";

.slide-enter-from {
  transform: translateX($tab-width * -1 - 50px);
}

.slide-enter-to {
  transform: translateX(0px);
}

.slide-leave-from {
  transform: translateX(0px);
}

.slide-leave-to {
  transform: translateX($tab-width * -1 - 50px);
}

.slide-enter-active,
.slide-leave-active {
  transition: all .4s ease;
}
</style>