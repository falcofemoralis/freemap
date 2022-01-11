import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';
import { axiosInstance } from '@/api';
import CreatedObject from '@/types/CreatedObject';
import { MapDataDto } from '../../../../shared/dto/map/mapdata.dto';

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

  async postCreatedObject(createdObject: CreatedObject) {
    if (createdObject.name && createdObject.coordinates && createdObject.typeId) {
      const data: MapDataDto = {
        name: createdObject.name,
        coordinates: JSON.stringify(createdObject.coordinates),
        typeId: createdObject.typeId,
        subtypeId: createdObject.subtypeId,
        address: createdObject.address,
        links: createdObject.links
      };

      const res = await axiosInstance.post('/map', data);

      console.log(res);
    }
  }
}

export const mapEditor = new Module({
  namespaced: false,
  state: EditorState,
  getters: EditorGetters,
  mutations: EditorMutations,
  actions: EditorActions
});
