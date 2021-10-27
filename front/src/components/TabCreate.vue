<template>
  <div v-if="obj" class="tab">
    <input v-model="obj.name" placeholder="Enter name" />
    <button @click="complete">Complete</button>
  </div>
</template>

<script>
import { ref, watch } from "vue";

export default {
  name: "TabCreate",
  props: {
    createdObject: {
      required: true,
    },
  },
  setup(props, context) {
    const obj = ref(null);

    watch(props, () => {
      obj.value = props.createdObject;
    });

    function complete() {
      context.emit("completeCreate", obj.value);
    }

    return {
      obj,

      complete,
    };
  },
};
</script>

<style lang="scss" scoped>
.hidden {
  display: none;
}

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
</style>