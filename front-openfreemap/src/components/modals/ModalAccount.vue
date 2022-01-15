<template>
  <BaseModal>
    <div class="modalField">
      <h4>Логин</h4>
      <input v-model="login" placeholder="Enter login" />
    </div>
    <div class="modalField">
      <h4>Пароль</h4>
      <input v-model="password" type="password" placeholder="Enter password" />
    </div>
    <div class="modalField" v-if="!isLogin">
      <h4>Пароль ещё раз</h4>
      <input v-model="confirmPassword" type="password" placeholder="Confirm password" />
    </div>
    <div class="modalField" v-if="!isLogin">
      ФОТО
    </div>

    <div v-if="isLogin" class="authButtons">
      <button class="submitBtn" @click="onLoginHandler">Войти</button>
      <button @click="toggleAuthType">Регистрация</button>
    </div>
    <div v-else class="authButtons">
      <button class="submitBtn" @click="onRegisterHandler">Зарегистрироваться</button>
      <button @click="toggleAuthType">Авторизация</button>
    </div>
  </BaseModal>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { User } from '@/types/User';
import BaseModal from '@/components/modals/BaseModal.vue';

export default defineComponent({
  name: 'ModalAccount',
  components: { BaseModal },
  setup(props: any, context: any) {
    const login = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const isLogin = ref(true);

    function onLoginHandler() {
      const user: User = {
        login: login.value,
        password: password.value
      };

      context.emit('login', user);
    }

    function onRegisterHandler() {
      if (password.value === confirmPassword.value) {
        const user: User = {
          login: login.value,
          password: password.value
        };

        context.emit('register', user);
      }
    }

    function toggleAuthType() {
      isLogin.value = !isLogin.value;
    }

    return {
      login,
      password,
      confirmPassword,
      isLogin,

      toggleAuthType,
      onLoginHandler,
      onRegisterHandler
    };
  }
});
</script>

<style lang="scss" scoped>
@import "~@/styles/interface/elements.scss";
@import "~@/styles/base.scss";

.authButtons {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.modalField {
  @extend %field;
  width: 240px;
}
</style>