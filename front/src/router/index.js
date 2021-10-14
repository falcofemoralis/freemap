import { createRouter, createWebHistory } from "vue-router";
import Main from '../pages/Main.vue'

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
