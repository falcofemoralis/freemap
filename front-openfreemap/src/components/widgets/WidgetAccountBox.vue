<template>
  <div>
    <ModalAccount v-if='isModalOpen' @close='toggleModal' />
    <div v-if='isUserMenuOpen' class='userMenu'>
      <ul>
        <li>
          Аккаунт
        </li>
        <li @click='logout'>
          Выйти
        </li>
      </ul>
    </div>
    <div class='accountBox'>
      <div v-if='isAuthed' @click='toggleUserMenu'>
        <img v-if='avatarUrl' class='avatarImage' :src='avatarUrl'>
        <img v-else class='avatarImage' :src="require('@/assets/no_avatar.png')">
      </div>
      <button v-else class='signInBtn' @click='toggleModal'>Войти</button>
    </div>
  </div>
</template>

<script lang='ts'>
import ModalAccount from '@/components/modals/ModalAccount.vue';
import { computed, defineComponent, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { AuthService } from '@/api/authService';

export default defineComponent({
  name: 'WidgetAccountBox',
  components: { ModalAccount },
  setup() {
    const store = useStore();
    const isModalOpen = ref(false);
    const isUserMenuOpen = ref(false);
    const isAuthed = computed(() => store.getters.isTokenValid);
    const avatarUrl = ref<string | null>(AuthService.getProfileAvatarUrl(store.getters.getProfileAvatar));

    watch(computed(() => store.getters.getProfileAvatar), (current) => {
      avatarUrl.value = AuthService.getProfileAvatarUrl(current);
    });

    function toggleModal() {
      isModalOpen.value = !isModalOpen.value;
    }

    function toggleUserMenu() {
      isUserMenuOpen.value = !isUserMenuOpen.value;
    }

    function logout() {
      store.dispatch('logout');
      toggleUserMenu();
    }

    return {
      isModalOpen,
      isUserMenuOpen,
      isAuthed,
      avatarUrl,

      toggleModal,
      toggleUserMenu,
      logout,
    };
  },
});
</script>

<style lang='scss' scoped>
@import "~@/styles/interface/widget.scss";
@import "~@/styles/interface/elements.scss";
@import "~@/styles/base.scss";

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
  cursor: pointer;
}

.userMenu {
  @extend %shadow;
  position: absolute;
  top: 75px;
  right: 35px;
  z-index: 10;
  background: #fff;
  padding: 15px;
}
</style>