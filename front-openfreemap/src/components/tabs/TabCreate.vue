<template>
  <div class="tab">
    <div>
      <div v-for="type in types" :key="type.id">
        <div :class="{selected: type.id === createdObject.typeId}">
          {{ type.name }}
        </div>
      </div>
    </div>
    <div>
      <span>Подтип</span>
      <select v-model="createdObject.subtypeId">
        <option v-for="subType in subTypes" :key="subType.id + 'd'" :value="subType.id">
          {{ subType.name }}
        </option>
      </select>
    </div>
    <div>
      <span>Название</span>
      <input v-model="createdObject.name" placeholder="Enter name" />
    </div>
    <div>
      <span>Адресс</span>
      <input v-model="createdObject.address" placeholder="Enter name" />
    </div>
    <div>
      <span>Ссылки</span>
      <input v-model="createdObject.links" placeholder="Enter name" />
    </div>
    <div>
      <span>Медиа</span>
    </div>

    <button @click="complete">Complete</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import CreatedObject from '@/types/CreatedObject';
import { axiosInstance } from '@/api';
import { ObjectSubTypeDto } from '@/../../shared/dto/map/objectsubtype.dto';
import { ObjectTypeDto } from '@/../../shared/dto/map/objecttype.dto';

export default defineComponent({
  name: 'TabCreate',
  props: {
    editType: {
      type: String
    }
  },
  async setup(props: any, context: any) {
    /* init data */
    const types = ref<Array<ObjectTypeDto>>((await axiosInstance.get<Array<ObjectTypeDto>>('/map/getObjectTypes')).data);
    const subTypes = ref<Array<ObjectSubTypeDto>>((await axiosInstance.get<Array<ObjectSubTypeDto>>('/map/getObjectSubTypes')).data);


    /* init object data */
    const createdObject = reactive<CreatedObject>(new CreatedObject());
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
.tab {
  z-index: 5;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 400px;
  height: 100%;
  background: #fff;
  box-shadow: 0px 4px 22px rgba(0, 0, 0, 0.25);
}

.selected {
  color: aqua;
}
</style>