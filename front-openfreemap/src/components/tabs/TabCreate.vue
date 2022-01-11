<template>
  <div class="tab">
    <div>
      <div class="type__cont">
        <div v-for="type in types" :key="type.id" class="type"
             :class="{'type__selected': type.id === createdObject.typeId}">
          {{ type.name }}
        </div>
      </div>
    </div>
    <div class="field">
      <span>Подтип</span>
      <select v-model="createdObject.subtypeId">
        <option v-for="subType in subTypes" :key="subType.id + 'd'" :value="subType.id">
          {{ subType.name }}
        </option>
      </select>
    </div>
    <div class="field">
      <span>Название</span>
      <input v-model="createdObject.name" placeholder="Enter name" />
    </div>
    <div class="field">
      <span>Адресс</span>
      <input v-model="createdObject.address" placeholder="Enter name" />
    </div>
    <div class="field">
      <span>Ссылки</span>
      <input v-model="createdObject.links" placeholder="Enter name" />
    </div>
    <div class="field">
      <span>Медиа</span>
    </div>

    <div class="container">
      <button @click="complete">Создать</button>
    </div>
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
@import "~@/styles/interface/tabs.scss";

.type {
  border-radius: 10px;
  width: auto;
  padding: 8px 20px 8px 20px;
  margin: 6px 20px 6px 20px;
  color: gray;

  &__cont {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-content: center;
    border: #b6b6b6 solid 1px;
    border-radius: 12px;
    margin: 15px;
  }

  &__selected {
    background: #fff;
    box-shadow: 4px 2px 20px 0px #dfdfdf;
    color: black;
  }
}

.field {
  display: flex;
  flex-direction: column;
  margin: 15px;
}

span {
  color: #1c1a1a;
}

input {
  outline: none;
  margin: 7px 0 7px 0;
  padding: 12px;
  border: none;
  border-radius: 12px;
  box-shadow: 4px 2px 20px 0px #dfdfdf;
}

select {
  margin: 7px 0 7px 0;
  padding: 12px;
  border: none;
  border-radius: 12px;
  outline: none;
}

.container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
}

button {
  cursor: pointer;
  height: 40px;
  width: 120px;
  background: #26bae8;
  color: #fff;
  outline: none;
  border: none;
  border-radius: 12px;
  box-shadow: 4px 2px 20px 0px #dfdfdf;
}
</style>