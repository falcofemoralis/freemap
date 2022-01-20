<template>
  <BaseTab>
    <h2 class='field'> {{ featureProperties.name }}</h2>
    <span class='field'> {{ featureProperties.desc }}</span>
    <span class='field'>Адресс: {{ featureProperties.address }}</span>
    <span class='field'>Ссылки: {{ featureProperties.links }}</span>
    <span class='field'>
      Автор: {{ user.login }}
      <img class='avatarImage' :src='getUserAvatarLink(user.avatarUrl)' />
    </span>
    <div class='imageSlider' v-if='featureProperties.mediaNames.length > 0'>
      <img v-for='(media, i) in featureProperties.mediaNames' :key='media' :src='getMediaUrl(media)'
           @click='openImage(featureProperties.mediaNames, i)'>
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
import { AuthService } from '@/api/authService';
import { UserDataDto } from '@/../../shared/dto/auth/userdata.dto';
import 'viewerjs/dist/viewer.css';
import { api as viewerApi } from 'v-viewer';

export default defineComponent({
  name: 'TabSelect',
  components: { BaseTab },
  props: {
    feature: {
      type: Object,
    },
  },
  async setup(props: any, context: any) {
    /**
     * Отслеживание перевыбора объекта на карте. Получение парамтеров объекта карты. Получение данных про пользователя создавшего объект
     */
    watch(() => props.feature, async (sel: Feature<Geometry>) => {
      featureProperties.value = await getProperties(sel);
      user.value = await AuthService.getProfileById(featureProperties.value.userId);
    });
    const featureProperties = ref<FeatureProperties>(await getProperties(props.feature));
    const user = ref<UserDataDto>(await AuthService.getProfileById(featureProperties.value.userId));

    /**
     * Получение параметров из feature объекта карты. Также идет получения возможных медиа файлов объекта.
     * @param feature
     */
    async function getProperties(feature: Feature<Geometry>): Promise<FeatureProperties> {
      const fp = feature.getProperties() as FeatureProperties;

      if (!fp.mediaNames) {
        fp.mediaNames = await MapService.getObjectMedia(fp.id);
      }

      return fp;
    }

    /**
     * Получение url медиа файла
     * @param name
     */
    function getMediaUrl(name: string): string {
      return MapService.getMediaLink(featureProperties.value.id, name);
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

    return {
      featureProperties,
      user,

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