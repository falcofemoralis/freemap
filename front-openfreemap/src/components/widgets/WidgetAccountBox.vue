<template>
  <div>
    <ModalAccount v-if="isModalOpen" @close="toggleModal" />
    <div class="accountBox">
      <div v-if="isAuthed">
        <img v-if="avatarUrl" class="avatarImage" :src="avatarUrl">
        <img v-else class="avatarImage" :src="require('@/assets/no_avatar.png')">
      </div>
      <button v-else class="signInBtn" @click="toggleModal">Войти</button>
    </div>
  </div>
</template>

<script lang="ts">
import ModalAccount from '@/components/modals/ModalAccount.vue';
import { CreatedUser } from '@/types/CreatedUser';
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { AuthService } from '@/api/authService';

export default defineComponent({
  name: 'WidgetAccountBox',
  components: { ModalAccount },
  setup() {
    const store = useStore();
    const isModalOpen = ref(false);
    const isAuthed = computed(() => store.getters.isTokenValid);
    const avatarUrl = ref<string | null>(AuthService.getProfileAvatarUrl(store.getters.getProfileAvatar));
    console.log(avatarUrl.value);
    watch(computed(() => store.getters.getProfileAvatar), (current) => {
      avatarUrl.value = AuthService.getProfileAvatarUrl(current);
    });


    function toggleModal() {
      isModalOpen.value = !isModalOpen.value;
    }

    return {
      isModalOpen,
      isAuthed,
      avatarUrl,

      toggleModal
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/widget.scss";
@import "~@/styles/interface/elements.scss";

.accountBox {
  z-index: 1;
  position: absolute;
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

.avatarImage {
  width: 50px;
  height: 50px;
  border-radius: 50px;
}
</style>