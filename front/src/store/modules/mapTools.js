export default {
    actions: {
        setMapType: (context, type) => context.commit("SET_MAPTYPE", type),
    },
    mutations: {
        SET_MAPTYPE: (state, type) => state.mapType = type
    },
    state: {
        mapType: null
    },
    getters: {
        getMapType(state) {
            return state.mapType;
        }
    },
}