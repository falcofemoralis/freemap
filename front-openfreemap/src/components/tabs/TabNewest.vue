<template>
  <BaseTab>
    <div class='container'>
      <div v-for='feature in newestFeatures' :key='feature.properties.id'
           @click='onItemSelected(feature.geometry.coordinates, feature.properties.zoom)'
           class='item'>
        <span>{{ feature.properties.name }}</span>
        <span>Автор: {{ feature.properties.userId }}</span>
      </div>
    </div>
  </BaseTab>
</template>

<script lang='ts'>
import { MapFeatureDto } from '@/../../../shared/dto/map/mapData.dto';
import { MapService } from '@/api/mapService';
import { inject, ref } from 'vue';
import BaseTab from '@/components/tabs/BaseTab.vue';
import Map from 'ol/Map';

export default {
  name: 'TabNewest',
  components: { BaseTab },
  async setup() {
    const map = inject<Map>('map');
    const newestFeatures = ref<Array<MapFeatureDto>>(await MapService.getNewestObjects(10));
    const view = map?.getView();

    function onItemSelected(coordinates: number[][][], zoom: number) {
      //[3896242.816040075,6076995.82677048]
      let sumX = 0;
      let sumY = 0;
      let n = 0;

      for (const coord of coordinates[0]) {
        sumX += coord[0];
        sumY += coord[1];
        n++;
      }

      //  const bern = fromLonLat([7.4458, 46.95]);
      //  console.log(bern);

      flyTo([sumX / n, sumY / n], zoom);
    }

    function flyTo(location: number[], zoom: number) {
      const duration = 2000;

      let parts = 2;
      let called = false;

      /*        function callback(complete) {
              --parts;
               if (called) {
                 return;
               }
               if (parts === 0 || !complete) {
                 called = true;
                 cb(complete);
               }
             }*/

      view?.animate(
        {
          center: location,
          duration: duration,
        },
        // callback,
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
        // callback,
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
  height: 60px;
  width: 100%;
  cursor: pointer;
  transition: all .3s;
  display: flex;
  padding: 16px;
  flex-direction: column;
  justify-content: center;

  &:hover {
    background: #d2d2d2;
  }
}
</style>