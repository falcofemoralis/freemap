<template>
  <BaseTab>
    <h2 class="field"> {{ featureProperties.name }}</h2>
    <span class="field"> {{ featureProperties.desc }}</span>
    <span class="field">Адресс: {{ featureProperties.address }}</span>
    <span class="field">Ссылки: {{ featureProperties.links }}</span>
  </BaseTab>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { FeatureProperties } from '../../../../shared/dto/map/mapdata.dto';
import BaseTab from '@/components/tabs/BaseTab.vue';

export default defineComponent({
  name: 'TabSelect',
  components: { BaseTab },
  props: {
    feature: {
      type: Object
    }
  },
  setup(props: any, context: any) {
    const text = ref('hello');
    const featureProperties = reactive<FeatureProperties>((props.feature as Feature<Geometry>).getProperties() as FeatureProperties);

    return {
      text,
      featureProperties,
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/tab.scss";
</style>