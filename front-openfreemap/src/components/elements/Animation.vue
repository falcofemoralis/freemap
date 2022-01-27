<template>
  <transition :name=type>
    <slot></slot>
  </transition>
</template>

<script lang='ts'>
export default {
  name: 'Animation',
  props: {
    type: {
      type: String,
      required: true,
    },
  },
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
