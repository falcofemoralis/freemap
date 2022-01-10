import { Module, createStore } from 'vuex-smart-module';
import { mapEditor } from '@/store/modules/mapEditor';
import { mapTools } from '@/store/modules/mapTools';

const store = createStore(
  new Module({
    modules: {
      mapEditor,
      mapTools
    }
  }),
  // Vuex store options
  {
    strict: process.env.NODE_ENV !== 'production'
  }
);

export default store;
