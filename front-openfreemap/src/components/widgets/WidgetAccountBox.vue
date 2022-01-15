<template>
  <div>
    <ModalAccount v-if="isModalOpen" @close="toggleModal" @login="onLoginHandler" @register="onRegisterHandler" />
    <div class="accountBox">
      <div v-if="isAuthed">
        MASTER IS HERE
      </div>
      <button v-else class="signInBtn" @click="toggleModal">Войти</button>
    </div>
  </div>
</template>

<script lang="ts">
import ModalAccount from '@/components/modals/ModalAccount.vue';
import { User } from '@/types/User';
import { computed, defineComponent, ref } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'WidgetAccountBox',
  components: { ModalAccount },
  setup() {
    const store = useStore();
    const isModalOpen = ref(false);
    const isAuthed = computed(() => store.getters.isTokenValid);

    function toggleModal() {
      isModalOpen.value = !isModalOpen.value;
    }

    function onLoginHandler(user: User) {
      store.dispatch('login', user);

      toggleModal();
    }

    function onRegisterHandler(user: User) {
      store.dispatch('register', user);

      toggleModal();
    }

    return {
      isModalOpen,
      isAuthed,

      toggleModal,
      onLoginHandler,
      onRegisterHandler
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/widget.scss";
@import "~@/styles/interface/elements.scss";

.accountBox {
  @extend %box;
  right: 35px;
  top: 20px;
  width: auto;
  height: auto;
}

.signInBtn {
  @extend %button;
  height: 30px;
  width: 70px;
  background: #0b77d2;
  border-radius: 7px;
  color: #fff;
}
</style>