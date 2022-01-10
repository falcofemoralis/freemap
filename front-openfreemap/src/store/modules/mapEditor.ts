import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';
import { axiosInstance } from '@/api';
import CreatedObject from '@/types/CreatedObject';
import GeometryType from '@/constants/GeometryType';
import EditType from '@/constants/EditType';
import { ObjectTypeDto } from '@/types/dto/ObjectTypeDto';

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
    const types = await axiosInstance.get<Array<ObjectTypeDto>>('/map/getObjectTypes');

    const type = types.data.find((val) => val.key == createdObject.type);
    if (type != null) {
      const res = await axiosInstance.post('/map', {
        name: createdObject.name,
        coordinates: JSON.stringify(createdObject.coordinates),
        typeId: type.id,
        subtypeId: 1
      });

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
