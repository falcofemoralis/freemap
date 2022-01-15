import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';
import { axiosInstance, getConfig } from '@/api';
import CreatedObject from '@/types/CreatedObject';
import { MapObjectDto } from '../../../../shared/dto/map/mapobject.dto';

// https://github.com/ktsn/vuex-smart-module
class EditorState {
  isDrawing = false;
}

class EditorGetters extends Getters<EditorState> {
  get getIsDrawing(): boolean {
    return this.state.isDrawing;
  }
}

class EditorMutations extends Mutations<EditorState> {
  toggleIsDrawing() {
    this.state.isDrawing = !this.state.isDrawing;
  }
}

class EditorActions extends Actions<EditorState,
  EditorGetters,
  EditorMutations,
  EditorActions> {
  toggleIsDrawing() {
    this.commit('toggleIsDrawing');
  }

  async postCreatedObject(payload: { createdObject: CreatedObject, token: string }) {
    const { createdObject, token } = payload;
    if (createdObject.name && createdObject.desc && createdObject.coordinates && createdObject.typeId) {
      const mapObjectDto: MapObjectDto = {
        name: createdObject.name,
        desc: createdObject.desc,
        coordinates: JSON.stringify(createdObject.coordinates),
        typeId: createdObject.typeId,
        subtypeId: createdObject.subtypeId,
        address: createdObject.address,
        links: createdObject.links
      };

      const res = await axiosInstance.post('/map', mapObjectDto, getConfig(token));
    }
  }
}

export const editorModule = new Module({
  namespaced: false,
  state: EditorState,
  getters: EditorGetters,
  mutations: EditorMutations,
  actions: EditorActions
});
