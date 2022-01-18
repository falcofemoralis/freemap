import { createStore, Module } from 'vuex-smart-module';
import { editorModule } from '@/store/modules/editorModule';
import { toolsModule } from '@/store/modules/toolsModule';
import { authModule } from '@/store/modules/authModule';

const store = createStore(
  new Module({
    modules: {
      editorModule,
      toolsModule,
      authModule,
    },
  }),
  // Vuex store options
  {
    strict: process.env.NODE_ENV !== 'production',
  },
);

export default store;
