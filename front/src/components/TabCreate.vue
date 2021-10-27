<template>
  <div v-if="createdObject" class="tab">
    <input v-model="createdObject.name" placeholder="Enter name" />
    <button @click="complete">Complete</button>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";

export default {
  name: "TabCreate",
  setup(props, context) {
    const store = useStore();

    const createdObject = computed(() => store.getters.getCreatedObject);
    function complete() {
      createdObject.value.feature.setProperties({
        name: createdObject.value.name,
      });

      context.emit("createComplete", createdObject.value);
      store.dispatch("setCreatedobject", null);
    }

    return {
      createdObject,

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