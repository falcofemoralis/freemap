export default {
    actions: {
        setSelectedtype: (context, type) => context.commit("SET_SELECTEDTYPE", type),
    },
    mutations: {
        SET_SELECTEDTYPE: (state, type) => state.selectedType = type
    },
    state: {
        selectedType: null
    },
    getters: {
        getSelectedType(state) {
            return state.selectedType;
        }
    },
}