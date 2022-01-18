<template>
  <BaseModal>
    <div class='modalField'>
      <h4>Логин</h4>
      <input v-model='createdUser.login' placeholder='Enter login' />
    </div>

    <div class='modalField' v-if='!isLogin'>
      <h4>Email</h4>
      <input v-model='createdUser.email' type='email' placeholder='Enter email' />
    </div>

    <div class='modalField'>
      <h4>Пароль</h4>
      <input v-model='createdUser.password' type='password' placeholder='Enter password' />
    </div>

    <div class='modalField' v-if='!isLogin'>
      <h4>Пароль ещё раз</h4>
      <input v-model='createdUser.confirmPassword' type='password' placeholder='Confirm password' />
    </div>

    <div class='modalField' v-if='!isLogin'>
      <h4>Аватар</h4>
      <input type='file' accept='image/*' @change='photoChangedHandler'>
    </div>

    <div v-if='isLogin' class='authButtons'>
      <button class='submitBtn' @click='onLoginHandler'>Войти</button>
      <button class='toggleBtn' @click='toggleAuthType'>Регистрация</button>
    </div>

    <div v-else class='authButtons'>
      <button class='submitBtn' @click='onRegisterHandler'>Зарегистрироваться</button>
      <button class='toggleBtn' @click='toggleAuthType'>Авторизация</button>
    </div>

    <ul>
      <li v-for='error in errors' :key='error' class='errorText'>
        {{ error }}
      </li>
    </ul>
  </BaseModal>
</template>

<script lang='ts'>
import { defineComponent, reactive, ref } from 'vue';
import { CreatedUser } from '@/types/CreatedUser';
import BaseModal from '@/components/modals/BaseModal.vue';
import { AuthService } from '@/api/authService';

export default defineComponent({
  name: 'ModalAccount',
  components: { BaseModal },
  setup(props: any, context: any) {
    const isLogin = ref(true);
    const errors = ref<Array<string>>([]);
    const createdUser = reactive<CreatedUser>({
      login: '',
      password: '',
      confirmPassword: '',
      email: '',
    });

    /**
     * Переключение режима аунтефикации
     */
    function toggleAuthType() {
      isLogin.value = !isLogin.value;
    }

    /**
     * Авторизация юзера
     */
    async function onLoginHandler() {
      errors.value = [];

      if (!createdUser.login && !createdUser.password) {
        errors.value.push('Введены не все поля!');
      }

      if (errors.value.length > 0) {
        return;
      }

      try {
        await AuthService.login(createdUser);
        context.emit('close');
      } catch (e) {
        errors.value.push((e as Error).message);
      }
    }

    /**
     * Регистрация юзера
     */
    async function onRegisterHandler() {
      errors.value = [];

      if (!createdUser.login && !createdUser.password && !createdUser.confirmPassword) {
        errors.value.push('Введены не все поля!');
      }

      if (createdUser.password !== createdUser.confirmPassword) {
        errors.value.push('Пароли не совпадают!');
      }

      if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(createdUser.email))) {
        errors.value.push('Некорректный email');
      }

      if (errors.value.length > 0) {
        return;
      }

      try {
        await AuthService.register(createdUser);
        context.emit('close');
      } catch (e) {
        errors.value.push((e as Error).message);
      }
    }

    /**
     * Отслеживание измненения смены загруженного файла
     * @param {Event} e - событие с загруженным файлом
     */
    function photoChangedHandler(e: any) {
      if (e.target.files.length > 0) {
        createdUser.avatar = e.target.files[0] as File;
      }
    }

    return {
      createdUser,
      isLogin,
      errors,

      toggleAuthType,
      onLoginHandler,
      onRegisterHandler,
      photoChangedHandler,
    };
  },
});
</script>

<style lang='scss' scoped>
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
  width: 340px;
}

.toggleBtn {
  @extend %button;
  margin: 15px 0 10px 0;
  color: #127b9b;
}

.loginAvailabilityText {
  color: green;
  font-size: 12px;
}
</style>