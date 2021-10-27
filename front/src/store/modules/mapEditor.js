export default {
    actions: {
        setSelectedtype: (context, type) => context.commit("SET_SELECTEDTYPE", type),
        setDraw: (context, draw) => context.commit("SET_DRAW", draw),
        setGeometry: (context, geometry) => context.commit("SET_GEOMETRY", geometry),
        setCreatedobject: (context, obj) => context.commit("SET_CREATEDOBJECT", obj)
    },
    mutations: {
        SET_SELECTEDTYPE: (state, type) => state.selectedType = type,
        SET_DRAW: (state, draw) => state.draw = draw,
        SET_GEOMETRY: (state, geometry) => state.geometry = geometry,
        SET_CREATEDOBJECT: (state, obj) => state.createdObject = obj
    },
    state: {
        selectedType: null,
        draw: null,
        geometry: null,
        createdObject: null
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
        },
        getCreatedObject(state) {
            return state.createdObject
        }
    },
}