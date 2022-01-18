<template>
  <BaseTab>
    <div class='cont'>
      Loading...
    </div>
  </BaseTab>
</template>

<script lang='ts'>
import BaseTab from '@/components/tabs/BaseTab.vue';

export default {
  name: 'TabLoading',
  components: { BaseTab },
};
</script>

<style lang='scss' scoped>
.cont {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>