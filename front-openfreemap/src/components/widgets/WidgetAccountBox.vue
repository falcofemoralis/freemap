<template>
  <div>
    <ModalAccount v-if='isModalOpen' @close='toggleModal' />
    <div v-if='isUserMenuOpen' class='userMenu'>
      <ul>
        <li class='userMenu__field'>
          Аккаунт
        </li>
        <li class='userMenu__field' @click='logout'>
          Выйти
        </li>
      </ul>
    </div>
    <div class='accountBox'>
      <div v-if='isAuthed' @click='toggleUserMenu'>
        <img class='avatarImage' :src='avatarUrl'>
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
    const avatarUrl = ref<string>(getUserAvatarLink(store.getters.getProfileAvatar));

    /**
     * Отслеживание измнения аватара пользователя
     */
    watch(computed(() => store.getters.getProfileAvatar), (current) => {
      avatarUrl.value = getUserAvatarLink(current);
    });

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
     * Переключение модального окна аунтефикации
     */
    function toggleModal() {
      isModalOpen.value = !isModalOpen.value;
    }

    /**
     * Переключение меню авторизированого пользователя
     */
    function toggleUserMenu() {
      isUserMenuOpen.value = !isUserMenuOpen.value;
    }

    /**
     * Разлогин пользователя
     */
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

  &__field {
    cursor: pointer;
    padding: 10px;
    color: #000;
    transition: all .3s;

    &:hover {
      color: #26bae8;
    }

  }
}
</style>