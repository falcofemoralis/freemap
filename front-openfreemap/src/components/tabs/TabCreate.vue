<template>
  <BaseTab>
    <div class="type">
      <div v-for="type in types" :key="type.id" class="type__frame"
           :class="{'type__selected': type.id === createdObject.typeId}">
        {{ type.name }}
      </div>
    </div>
    <div class="field">
      <h4>Подтип</h4>
      <select class="type__list" v-model="createdObject.subtypeId">
        <option v-for="subType in subTypes" :key="subType.id + 'd'" :value="subType.id">
          {{ subType.name }}
        </option>
      </select>
    </div>
    <div class="field">
      <h4>Название</h4>
      <input v-model="createdObject.name" placeholder="Enter name" />
    </div>
    <div class="field">
      <h4>Описание</h4>
      <input v-model="createdObject.desc" placeholder="Enter desc" />
    </div>
    <div class="field">
      <h4>Адресс</h4>
      <input v-model="createdObject.address" placeholder="Enter address" />
    </div>
    <div class="field">
      <h4>Ссылки</h4>
      <input v-model="createdObject.links" placeholder="Enter links" />
    </div>
    <div class="field">
      <h4>Медиа</h4>
    </div>

    <button class="submitBtn" @click="complete">Создать</button>
  </BaseTab>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import { CreatedObject } from '@/types/CreatedObject';
import BaseTab from '@/components/tabs/BaseTab.vue';
import { ObjectSubTypeDto } from '@/../../shared/dto/map/objectsubtype.dto';
import { ObjectTypeDto } from '@/../../shared/dto/map/objecttype.dto';
import { MapService } from '@/api/mapService';

export default defineComponent({
  name: 'TabCreate',
  components: { BaseTab },
  props: {
    editType: {
      type: String
    }
  },
  async setup(props: any, context: any) {
    /* init data */
    const types = ref<Array<ObjectTypeDto>>(await MapService.getTypes());
    const subTypes = ref<Array<ObjectSubTypeDto>>(await MapService.getSubTypes());

    /* init object data */
    const createdObject = reactive<CreatedObject>({
      name: '',
      desc: '',
      coordinates: [],
      typeId: -1
    });
    const selectedType = types.value.find((val) => val.key == props.editType);
    if (selectedType) {
      createdObject.typeId = selectedType.id;
    }

    function complete() {
      context.emit('created', createdObject);
    }

    return {
      createdObject,
      types,
      subTypes,

      complete
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/tab.scss";
@import "~@/styles/interface/elements.scss";
</style>