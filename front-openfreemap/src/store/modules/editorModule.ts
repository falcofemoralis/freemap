import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';

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
}

export const editorModule = new Module({
  namespaced: false,
  state: EditorState,
  getters: EditorGetters,
  mutations: EditorMutations,
  actions: EditorActions,
});
