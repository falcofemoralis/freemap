import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';

// https://github.com/ktsn/vuex-smart-module
class MapState {
  selectedFeatureId: string | null = null;
}

class MapGetters extends Getters<MapState> {
  get getSelectedFeatureId(): string | null {
    return this.state.selectedFeatureId;
  }
}

class MapMutations extends Mutations<MapState> {
  SET_SELECTED_FEATURE_ID(selectedFeatureId: string) {
    this.state.selectedFeatureId = selectedFeatureId;
  }
}

class MapActions extends Actions<MapState, MapGetters, MapMutations, MapActions> {
  setSelectedFeatureId(selectedFeatureId: string) {
    this.commit('SET_SELECTED_FEATURE_ID', selectedFeatureId);
  }
}

export const mapModule = new Module({
  namespaced: false,
  state: MapState,
  getters: MapGetters,
  mutations: MapMutations,
  actions: MapActions,
});
