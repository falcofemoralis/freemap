import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import OpenLayersMap from './openlayers'

createApp(App).use(store).use(router).use(OpenLayersMap).mount("#app");
