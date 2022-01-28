<template>

    <h2 class='field'> {{ mapFeature?.properties.name }}</h2>
    <span class='field'> {{ mapFeature?.properties.description }}</span>
    <span class='field'>Адресс: {{ mapFeature?.properties.address }}</span>
    <span class='field'>Ссылки: {{ mapFeature?.properties.links }}</span>
    <span class='field'>
      Автор: {{ mapFeature?.properties.userLogin }}
      <img class='avatarImage' :src='getUserAvatarLink(mapFeature?.properties.userAvatar)' />
    </span>
    <div class='imageSlider' v-if='mapFeature?.properties.mediaNames.length > 0'>
      <img v-for='(media, i) in mapFeature?.properties.mediaNames' :key='media' :src='getMediaUrl(media)'
           @click='openImage(mapFeature?.properties.mediaNames, i)'>
    </div>

</template>

<script lang='ts'>
import { computed, defineComponent, ref, watch } from 'vue';
import BaseTab from '@/components/tabs/BaseTab.vue';
import { MapService } from '@/api/mapService';
import { AuthService } from '@/api/authService';
import 'viewerjs/dist/viewer.css';
import { api as viewerApi } from 'v-viewer';
import { FullFeatureDataDto, MapFeatureDto } from '@/dto/map/map-data.dto';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'TabSelect',
  components: {  },
  async setup() {
    const store = useStore();

    /**
     * Отслеживание перевыбора объекта на карте. Получение парамтеров объекта карты. Получение данных про пользователя создавшего объект
     */
    watch(computed(() => store.getters.getSelectedFeatureId), async (current) => {
      if (current) {
        mapFeature.value = await getProperties(current);
      } else {
        mapFeature.value = null;
      }
    });

    const properties = await getProperties(store.getters.getSelectedFeatureId);
    const mapFeature = ref<MapFeatureDto<FullFeatureDataDto> | null>(properties);

    /**
     * Получение параметров из feature объекта карты. Также идет получения возможных медиа файлов объекта.
     * @param featureId - id объекта
     */
    async function getProperties(featureId: string): Promise<MapFeatureDto<FullFeatureDataDto>> {
      return await MapService.getMapFeature(featureId);
    }

    /**
     * Получение url медиа файла
     * @param name
     */
    function getMediaUrl(name: string): string {
      if (mapFeature.value?.properties) {
        return MapService.getMediaLink(mapFeature.value?.properties.id ?? '', name);
      } else {
        return '';
      }
    }

    /**
     * Получение url аватара пользователя
     * @param avatar
     */
    function getUserAvatarLink(avatar: string | null): string {
      if (avatar) {
        return AuthService.getProfileAvatarUrl(avatar);
      } else {
        return require('@/assets/no_avatar.png');
      }
    }

    /**
     * Открытие слайдера просмотра изображения в полном экране
     * @param mediaNames - массив изображений
     * @param index - индекс открытого изображения
     */
    function openImage(mediaNames: Array<string>, index: number) {
      if (mediaNames.length > 0) {
        const viewer = viewerApi({
          images: mediaNames.map((name) => {
            return getMediaUrl(name);
          }),
          options: {
            initialViewIndex: index,
            title: false,
          },
        });
      }
    }

    await new Promise((resolve => setTimeout(resolve, 2000)))

    return {
      mapFeature,

      getMediaUrl,
      getUserAvatarLink,
      openImage,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/tab.scss";
@import "~@/styles/interface/elements.scss";

.imageSlider {
  display: flex;
  height: 100px;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;

  img {
    padding: 10px;
    height: 100%;
    width: auto;
    cursor: pointer;
  }
}

.avatarImage {
  width: 24px;
  height: 24px;
  border-radius: 50px;
  cursor: pointer;
}

</style>
