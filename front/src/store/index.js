import { createStore } from "vuex";
import mapEditor from "./modules/mapEditor"
import mapTools from "./modules/mapTools"

export default createStore({
  modules: {
    mapEditor,
    mapTools
  }
});
