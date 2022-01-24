<template>
  <BaseTab>
    <div class='container'>
      <div v-for='feature in newestFeatures' :key='feature.id'
           @click='onItemSelected(feature.coordinates, feature.zoom)'
           class='item'>
        <span class='item__name'>{{ feature.name }}</span>
        <span class='item__author'>Автор: {{ feature.userLogin }}</span>
      </div>
    </div>
  </BaseTab>
</template>

<script lang='ts'>
import { MapService } from '@/api/mapService';
import { inject, ref } from 'vue';
import BaseTab from '@/components/tabs/BaseTab.vue';
import Map from 'ol/Map';
import { Coordinate, NewestMapFeatureDto } from '@/dto/map/mapData.dto';
import { fromLonLat } from 'ol/proj';

export default {
  name: 'TabNewest',
  components: { BaseTab },
  async setup() {
    const map = inject<Map>('map');
    const newestFeatures = ref<Array<NewestMapFeatureDto>>(await MapService.getNewestObjects(10));
    const view = map?.getView();

    function onItemSelected(coordinates: Coordinate[], zoom: number) {
      let sumX = 0;
      let sumY = 0;
      let n = 0;

      for (const coordinate of coordinates) {
        sumX += coordinate.lon;
        sumY += coordinate.lat;
        n++;
      }

      flyTo(fromLonLat([sumX / n, sumY / n]), zoom);
    }

    function flyTo(location: number[], zoom: number) {
      const duration = 2000;

      view?.animate(
        {
          center: location,
          duration: duration,
        },
      );
      view?.animate(
        {
          zoom: zoom - 1,
          duration: duration / 2,
        },
        {
          zoom: zoom,
          duration: duration / 2,
        },
      );
    }

    return {
      newestFeatures,

      onItemSelected,
    };
  },
};
</script>

<style lang='scss' scoped>
.container {
  padding-top: 80px;
  width: 100%;
}

.item {
  box-sizing: border-box;
  width: 100%;
  cursor: pointer;
  transition: all .3s;
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: center;

  &__name {
    font-size: 16px;
    max-height: 18px;
    overflow: hidden;
  }

  &__author {
    font-size: 16px;
    max-height: 18px;
    overflow: hidden;
  }

  &:hover {
    background: #d2d2d2;
  }
}
</style>