<template>
  <BaseTab>
    <div class='type'>
      <div v-for='geometryType in geometryTypes' :key='geometryType.id' class='type__frame'
           :class="{'type__selected': geometryType.key === selectedGeometry?.key}">
        {{ geometryType.name }}
      </div>
    </div>
    <div class='field'>
      <h4>Подтип</h4>
      <select class='type__list' v-model='createdObject.typeId'>
        <option v-for='type in types' :key='type.id' :value='type.id'>
          {{ type.name }}
        </option>
      </select>
    </div>
    <div class='field'>
      <h4>Название</h4>
      <input v-model='createdObject.name' placeholder='Enter name' />
    </div>
    <div class='field'>
      <h4>Описание</h4>
      <input v-model='createdObject.description' placeholder='Enter desc' />
    </div>
    <div class='field'>
      <h4>Адресс</h4>
      <input v-model='createdObject.address' placeholder='Enter address' />
    </div>
    <div class='field'>
      <h4>Ссылки</h4>
      <input v-model='createdObject.links' placeholder='Enter links' />
    </div>
    <div class='field'>
      <h4>Медиа</h4>
      <input type='file' multiple accept='image/*, video/*' @change='mediaChangedHandler'>
    </div>
    <button class='submitBtn' @click='complete'>Создать</button>
    <ul>
      <li v-for='error in errors' :key='error' class='errorText'>
        {{ error }}
      </li>
    </ul>
  </BaseTab>
</template>

<script lang='ts'>
import { defineComponent, reactive, ref } from 'vue';
import { CreatedObject } from '@/types/CreatedObject';
import BaseTab from '@/components/tabs/BaseTab.vue';
import { MapService } from '@/api/mapService';
import { toLonLat } from 'ol/proj';
import ProjectionType from '@/constants/ProjectionType';
import { GeometryTypeDto } from '@/dto/map/geometry-type.dto';
import { ObjectTypeDto } from '@/dto/map/object-type.dto';
import { Coordinate } from '@/dto/map/map-data.dto';

export default defineComponent({
  name: 'TabCreate',
  components: { BaseTab },
  props: {
    editType: {
      type: String,
    },
    coordinates: {},
    zoom: {},
  },
  async setup(props: any, context: any) {
    /* init data */
    const errors = ref<Array<string>>([]);
    const geometryTypes = ref<Array<GeometryTypeDto>>(await MapService.getGeometryTypes());
    const selectedGeometry = ref<GeometryTypeDto | undefined>(geometryTypes.value.find((val: GeometryTypeDto) => val.key == props.editType));
    const types = ref<Array<ObjectTypeDto>>();
    if (selectedGeometry.value) {
      types.value = await MapService.getTypesByGeometry(selectedGeometry.value.id);
    }

    // Конвертирование коордиант geojson из EPSG:3857 в lon Lat
    const lotLatCoordinates: Coordinate[] = [];
    for (const tuple of props.coordinates as number[][][]) {
      for (const coordinate of tuple) {
        const lonLat = toLonLat(coordinate, ProjectionType.EPSG3857);
        lotLatCoordinates.push({ lon: lonLat[0], lat: lonLat[1] });
      }
    }

    /* init object data */
    const createdObject = reactive<CreatedObject>({
      name: '',
      description: '',
      typeId: '',
      coordinates: lotLatCoordinates,
      zoom: props.zoom,
    });

    /**
     * Завершение создания нового объекта
     */
    async function complete() {
      errors.value = [];

      if (!createdObject.name) {
        errors.value.push('Введите имя');
      } else if (createdObject.name.length > 30) {
        errors.value.push('Имя слишком длинное');
      }

      if (!createdObject.description) {
        errors.value.push('Введите описание');
      } else if (createdObject.description.length > 400) {
        errors.value.push('Описание слишком длинное');
      }

      if (!createdObject.typeId) {
        errors.value.push('Не выбран тип объекта');
      }

      if (createdObject.links && createdObject.links?.length > 100) {
        errors.value.push('Слишком много ссылок');
      }

      if (createdObject.address && createdObject.address?.length > 50) {
        errors.value.push('Слишком длинный адресс');
      }

      if (createdObject.mediaFiles && createdObject.mediaFiles.length > 20) {
        errors.value.push('Слишком много медиафайлов');
      }

      if (errors.value.length > 0) {
        return;
      }

      try {
        const createdFeature = await MapService.addMapObject(createdObject);
        context.emit('created', createdFeature);
      } catch (e) {
        errors.value.push((e as Error).message);
      }
    }

    /**
     * Отслеживание измнений дабавленных медиа файлов у объекта
     * @param e
     */
    function mediaChangedHandler(e: any) {
      if (e.target.files.length > 0) {
        createdObject.mediaFiles = e.target.files;
      }
    }

    return {
      createdObject,
      types,
      geometryTypes,
      selectedGeometry,
      errors,

      complete,
      mediaChangedHandler,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/tab.scss";
@import "~@/styles/interface/elements.scss";

.type {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  border: #b6b6b6 solid 1px;
  border-radius: 12px;

  &__frame {
    border-radius: 10px;
    width: auto;
    padding: 8px 10px 8px 10px;
    margin: 8px 10px 8px 10px;
    color: gray;
  }

  &__selected {
    @extend %lightShadow;
    background: #fff;
    color: black;
  }

  &__list {
    @extend %list;
    @extend %lightShadow;
    box-sizing: border-box;
    width: 100%;
    margin: 7px 0 7px 0;
    padding: 12px;
    border-radius: 12px;
  }
}
</style>