<template>
  <BaseTab>
    <div class='logo'>
      <img class='logo__img' :src="require('@/assets/logo.png')" />
      <span class='logo__text'>OpenFreeMap</span>
    </div>
    <nav class='menu'>
      <ul>
        <li class='menu__item'>
          <img :src="require('@/assets/new.png')" />
          <span>Новое</span>
        </li>
        <li class='menu__item'>
          <img :src="require('@/assets/home.png')" />
          <span>Главная</span>
        </li>
        <li class='menu__item'>
          <img :src="require('@/assets/categories.png')" />
          <span>Категории</span>
        </li>
        <li class='menu__item'>
          <img :src="require('@/assets/check.png')" />
          <span>Проверка</span>
        </li>
        <li class='menu__item'>
          <img :src="require('@/assets/settings.png')" />
          <span>Настройки</span>
        </li>
      </ul>
    </nav>
    <div class='empty'></div>
  </BaseTab>
</template>

<script lang='ts'>
import BaseTab from '@/components/tabs/BaseTab.vue';

export default {
  name: 'TabMenu',
  components: { BaseTab },
  setup() {
    return {};
  },
};
</script>

<style lang='scss' scoped>

.empty {
  height: 10px;
  width: 100%;
  border-top: 1px solid #d9d9d9;
}

.logo {
  height: 50px;
  width: 100%;
  display: flex;
  align-items: center;

  &__img {
    height: 80%;
  }

  &__text {
    color: #4b4b4b;
    font-size: 24px;
    padding-left: 15px;
  }
}

.menu {
  display: flex;
  width: 100%;
  padding-top: 20px;
  border-top: 1px solid #d9d9d9;

  ul {
    width: 100%;
  }

  &__item {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 16px 16px 16px 16px;
    cursor: pointer;
    background: transparent;
    transition: all .3s;

    &:hover {
      background: #fff;
    }

    img {
      height: 24px;
    }

    span {
      color: #212121;
      font-size: 20px;
      margin-left: 36px;
    }
  }
}
</style>