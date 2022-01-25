import { createStore, Module } from 'vuex-smart-module';
import { editorModule } from '@/store/modules/editorModule';
import { toolsModule } from '@/store/modules/toolsModule';
import { authModule } from '@/store/modules/authModule';
import { mapModule} from '@/store/modules/mapModule';

const store = createStore(
  new Module({
    modules: {
      editorModule,
      toolsModule,
      authModule,
      mapModule
    },
  }),
  // Vuex store options
  {
    strict: process.env.NODE_ENV !== 'production',
  },
);

export default store;
