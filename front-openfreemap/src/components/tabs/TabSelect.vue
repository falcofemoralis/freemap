<template>
  <BaseTab>
    <h2 class='field'> {{ featureProperties.name }}</h2>
    <span class='field'> {{ featureProperties.desc }}</span>
    <span class='field'>Адресс: {{ featureProperties.address }}</span>
    <span class='field'>Ссылки: {{ featureProperties.links }}</span>
    <span class='field'>{{ featureProperties.userId }}</span>
    <div class='imageSlider'>
      <img v-for='media in featureProperties.mediaNames' :key='media' :src='getMediaUrl(media)'>
    </div>
  </BaseTab>
</template>

<script lang='ts'>
import { defineComponent, ref, watch } from 'vue';
import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { FeatureProperties } from '../../../../shared/dto/map/mapdata.dto';
import BaseTab from '@/components/tabs/BaseTab.vue';
import { MapService } from '@/api/mapService';

export default defineComponent({
  name: 'TabSelect',
  components: { BaseTab },
  props: {
    feature: {
      type: Object,
    },
  },
  async setup(props: any, context: any) {
    const featureProperties = ref<FeatureProperties>(getProperties(props.feature));
    watch(() => props.feature, (sel: Feature<Geometry>) => {
      featureProperties.value = getProperties(sel);
    });

    if (!featureProperties.value.mediaNames) {
      featureProperties.value.mediaNames = await MapService.getObjectMedia(featureProperties.value.id);
    }

    function getProperties(feature: Feature<Geometry>): FeatureProperties {
      return feature.getProperties() as FeatureProperties;
    }

    function getMediaUrl(name: string): string {
      return MapService.getMediaLink(featureProperties.value.id, name);
    }

    return {
      featureProperties,

      getMediaUrl,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/tab.scss";
@import "~@/styles/interface/elements.scss";

.imageSlider {
  height: 100px;
  width: 100%;

  img {
    height: 100%;
    width: auto;
  }
}
</style>