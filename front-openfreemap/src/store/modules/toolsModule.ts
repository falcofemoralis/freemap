import { Actions, Getters, Module, Mutations } from 'vuex-smart-module';
import MapType from '@/constants/MapType';

class ToolsState {
  mapType: MapType = MapType.OSM;
}

class ToolsGetters extends Getters<ToolsState> {
  get getMapType(): MapType {
    return this.state.mapType;
  }
}

class ToolsMutations extends Mutations<ToolsState> {
  setMapType(type: MapType) {
    this.state.mapType = type;
  }
}

class ToolsActions extends Actions<ToolsState,
  ToolsGetters,
  ToolsMutations,
  ToolsActions> {
  setMapType(type: MapType) {
    this.commit('setMapType', type);
  }
}

export const toolsModule = new Module({
  namespaced: false,
  state: ToolsState,
  getters: ToolsGetters,
  mutations: ToolsMutations,
  actions: ToolsActions,
});
