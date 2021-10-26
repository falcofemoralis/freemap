export default {
    actions: {
        setSelectedtype: (context, type) => context.commit("SET_SELECTEDTYPE", type),
        setDraw: (context, draw) => context.commit("SET_DRAW", draw),
        setGeometry: (context, geometry) => context.commit("SET_GEOMETRY", geometry),
    },
    mutations: {
        SET_SELECTEDTYPE: (state, type) => state.selectedType = type,
        SET_DRAW: (state, draw) => state.draw = draw,
        SET_GEOMETRY: (state, geometry) => state.geometry = geometry
    },
    state: {
        selectedType: null,
        draw: null,
        geometry: null
    },
    getters: {
        getSelectedType(state) {
            return state.selectedType;
        },
        getDraw(state) {
            return state.draw;
        },
        getGeometry(state) {
            return state.geometry;
        }
    },
}