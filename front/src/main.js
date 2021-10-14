import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import OpenLayersMap from 'vue3-openlayers'
import 'vue3-openlayers/dist/vue3-openlayers.css'

createApp(App).use(store).use(router).use(OpenLayersMap).mount("#app");
